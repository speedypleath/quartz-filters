import path from "node:path";
import fs from "node:fs/promises";
import type {
  BuildCtx,
  FilePath,
  ProcessedContent,
  QuartzEmitterPlugin,
} from "@quartz-community/types";
import { INDEX_FILE, type FrontmatterIndexFile, type IndexedNote } from "./index-format";
import type { FieldValue, NoteFields, Scalar } from "./query/types";

export interface FrontmatterIndexOptions {
  /** Frontmatter keys to leave out of the public index. Matched regardless of case. */
  excludeFields: string[];
  /** When set, only these keys are indexed. `title` and `path` are always included. */
  fields?: string[];
}

const defaultOptions: FrontmatterIndexOptions = { excludeFields: [] };
const BUILT_IN = new Set(["title", "path"]);

function normalizeScalar(value: unknown): Scalar | undefined {
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  return undefined;
}

/** Keeps strings, numbers, booleans and dates (as ISO strings). Arrays keep only those. */
export function normalizeValue(value: unknown): FieldValue | undefined {
  if (Array.isArray(value)) {
    return value.map(normalizeScalar).filter((v): v is Scalar => v !== undefined);
  }
  return normalizeScalar(value);
}

export function indexNote(
  slug: string,
  frontmatter: Record<string, unknown>,
  options: FrontmatterIndexOptions,
): IndexedNote {
  const excluded = new Set(options.excludeFields.map((f) => f.toLowerCase()));
  const allowed = options.fields ? new Set(options.fields.map((f) => f.toLowerCase())) : null;
  const fields: NoteFields = {};

  for (const [key, raw] of Object.entries(frontmatter)) {
    const lower = key.toLowerCase();
    if (BUILT_IN.has(lower) || excluded.has(lower)) continue;
    if (allowed && !allowed.has(lower)) continue;
    const value = normalizeValue(raw);
    if (value !== undefined) fields[key] = value;
  }

  const title =
    typeof frontmatter.title === "string" && frontmatter.title.length > 0
      ? frontmatter.title
      : slug;
  fields.title = title;
  fields.path = slug;
  return { path: slug, title, fields };
}

/** Writes every published note's frontmatter to `static/quartz-filters/index.json`. */
export const FrontmatterIndex: QuartzEmitterPlugin<Partial<FrontmatterIndexOptions>> = (
  userOptions?: Partial<FrontmatterIndexOptions>,
) => {
  const options: FrontmatterIndexOptions = { ...defaultOptions, ...userOptions };

  const emitIndex = async (ctx: BuildCtx, content: ProcessedContent[]): Promise<FilePath[]> => {
    const notes = content.flatMap(([, vfile]) => {
      const slug = vfile.data?.slug;
      if (typeof slug !== "string") return [];
      const frontmatter = (vfile.data?.frontmatter ?? {}) as Record<string, unknown>;
      return [indexNote(slug, frontmatter, options)];
    });
    const file: FrontmatterIndexFile = { version: 1, notes };
    const outputPath = path.join(ctx.argv.output, INDEX_FILE);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(file));
    return [outputPath as FilePath];
  };

  return {
    name: "FrontmatterIndex",
    async emit(ctx, content) {
      return emitIndex(ctx, content);
    },
    async *partialEmit(ctx, content) {
      yield* await emitIndex(ctx, content);
    },
  };
};
