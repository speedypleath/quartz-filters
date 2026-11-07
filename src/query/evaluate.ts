import type { Clause, EvalOptions, Expr, Literal, NoteFields, Scalar } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/;

export function matches(ast: Expr, fields: NoteFields, opts: EvalOptions): boolean {
  switch (ast.kind) {
    case "and":
      return matches(ast.left, fields, opts) && matches(ast.right, fields, opts);
    case "or":
      return matches(ast.left, fields, opts) || matches(ast.right, fields, opts);
    case "not":
      return !matches(ast.expr, fields, opts);
    case "clause":
      return matchClause(ast, fields, opts.caseSensitive);
  }
}

/** Every value stored under `name`, with arrays flattened. `undefined` when the field is missing. */
function lookup(fields: NoteFields, name: string, caseSensitive: boolean): Scalar[] | undefined {
  if (caseSensitive) {
    const value = fields[name];
    return value === undefined ? undefined : ([] as Scalar[]).concat(value);
  }
  const wanted = name.toLowerCase();
  let found: Scalar[] | undefined;
  for (const [key, value] of Object.entries(fields)) {
    if (key.toLowerCase() === wanted) found = (found ?? []).concat(value);
  }
  return found;
}

function matchClause(clause: Clause, fields: NoteFields, caseSensitive: boolean): boolean {
  const values = lookup(fields, clause.field, caseSensitive);
  if (clause.op === "has") return values !== undefined && values.some((v) => v !== "");

  const literal = clause.value;
  if (!literal) return false;
  const anyEqual = () => values?.some((v) => equal(v, literal, caseSensitive)) ?? false;

  switch (clause.op) {
    case "is":
    case "in":
      return anyEqual();
    case "is not":
    case "not in":
      return !anyEqual();
    case "contains":
      return values?.some((v) => contains(v, literal, caseSensitive)) ?? false;
    default:
      return values?.some((v) => ordered(v, literal, clause.op)) ?? false;
  }
}

const isDate = (s: string) => ISO_DATE.test(s) && !Number.isNaN(Date.parse(s));
const day = (s: string) => new Date(Date.parse(s)).toISOString().slice(0, 10);

/** Negative, zero or positive. A date-only literal compares on the field's UTC calendar day. */
function compareDates(field: string, literal: string): number {
  if (literal.length === 10) {
    const fieldDay = day(field);
    return fieldDay < literal ? -1 : fieldDay > literal ? 1 : 0;
  }
  return Math.sign(Date.parse(field) - Date.parse(literal));
}

const sameText = (a: string, b: string, caseSensitive: boolean) =>
  caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();

function equal(value: Scalar, literal: Literal, caseSensitive: boolean): boolean {
  if (literal.type === "number" && typeof value === "number")
    return value === Number(literal.value);
  if (literal.type === "date" && typeof value === "string" && isDate(value)) {
    return compareDates(value, literal.value) === 0;
  }
  if (literal.type === "boolean" && typeof value === "boolean") {
    return value === (literal.value === "true");
  }
  return sameText(String(value), literal.value, caseSensitive);
}

function contains(value: Scalar, literal: Literal, caseSensitive: boolean): boolean {
  const text = String(value);
  return caseSensitive
    ? text.includes(literal.value)
    : text.toLowerCase().includes(literal.value.toLowerCase());
}

function ordered(value: Scalar, literal: Literal, op: Clause["op"]): boolean {
  let cmp: number;
  if (literal.type === "number" && typeof value === "number") {
    cmp = Math.sign(value - Number(literal.value));
  } else if (literal.type === "date" && typeof value === "string" && isDate(value)) {
    cmp = compareDates(value, literal.value);
  } else {
    return false;
  }
  switch (op) {
    case "<":
      return cmp < 0;
    case ">":
      return cmp > 0;
    case "<=":
      return cmp <= 0;
    case ">=":
      return cmp >= 0;
    default:
      return false;
  }
}
