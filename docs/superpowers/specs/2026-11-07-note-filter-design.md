# Note filter: design

Date: 2026-11-07
Package: `@speedypleath/quartz-filters`

## Goal

Readers of a published Quartz site can narrow the Explorer to the notes whose frontmatter matches a
query written in plain words, such as `topic is "Electronics" and "seedling" in tags`. They can save
queries as bookmarks and run them again later.

Everything happens in the browser. Nothing is rebuilt, and nothing is stored on a server.

### In scope

- A query language with several kinds of clause, joined by `and`, `or`, `not` and parentheses.
- A build-time index of each published note's frontmatter.
- A sidebar panel with two tabs: **Filter** for writing the query, and **Saved** for bookmarks.
- Filtering the existing Explorer tree (`github:quartz-community/explorer`) live.
- Bookmarks that readers save themselves, kept in their browser's localStorage.

### Out of scope

- Build-time filters that decide what gets published.
- Bookmarks that the site author presets in config.
- A results list of the panel's own. The Explorer is the results view.
- Querying field names that contain spaces.
- Changing the Explorer plugin itself.

## Query language

### Clauses

| Form                                   | Example                  |
| -------------------------------------- | ------------------------ |
| `field is value`, `field is not value` | `topic is "Electronics"` |
| `value in field`, `value not in field` | `"seedling" in tags`     |
| `field contains value`                 | `title contains motor`   |
| `field < value` (and `>`, `<=`, `>=`)  | `created >= 2026-01-01`  |
| `has field`, `field exists`            | `has status`             |

Clauses combine with `not`, `and` and `or`, listed from tightest to loosest binding. Parentheses
group clauses. Keywords are case-insensitive.

### Grammar

```ebnf
query      = orExpr ;
orExpr     = andExpr { "or" andExpr } ;
andExpr    = notExpr { "and" notExpr } ;
notExpr    = "not" notExpr | primary ;
primary    = "(" orExpr ")" | clause ;
clause     = "has" field
           | term ( "in" | "not" "in" ) field
           | field ( "is" [ "not" ] | "contains" | "<" | ">" | "<=" | ">=" ) term
           | field "exists" ;
term       = string | number | date | boolean | bareword ;
field      = identifier ;
```

The parser tells `term in field` apart from `field is term` by looking at the token that follows the
first term.

### Tokens

- **Quoted strings** use double quotes. A `\"` inside one is a literal quote.
- **Numbers** look like `42`, `-3` or `4.5`.
- **Dates** look like `2026-01-01`, optionally followed by a time such as `T10:30`.
- **Booleans** are `true` and `false`.
- **Barewords** are single words without quotes, for example `status is done`. A value must be
  quoted if it contains spaces or is a keyword. The keywords are `is`, `not`, `in`, `and`, `or`,
  `has`, `exists`, `contains`, `true` and `false`.
- **Identifiers** start with a letter or `_`. After that they may contain letters, digits, `_`, `-`
  and `.`. Field names are matched case-insensitively against frontmatter keys.

### Built-in fields

- `title` is the note's title.
- `path` is the note's slug.
- These two always exist. If the frontmatter has a key called `path`, the built-in value replaces it.

### Matching rules

- **Equality** (`is`, `in`):
  - If both sides are numbers, they are compared as numbers.
  - If both sides are dates, they are compared as instants.
  - Otherwise both sides are compared as strings, ignoring case.
- **Array fields:**
  - `field is v` is true if any element equals `v`. This makes `tags is seedling` the same as
    `seedling in tags`.
  - On a scalar field, `v in field` is simply equality.
- **`contains`** checks for a substring, ignoring case. On an array field it is true if any element
  contains the value.
- **Ordering** (`< > <= >=`):
  - It only applies when both sides are numbers, or both sides are dates.
  - On an array field it is true if any element satisfies it.
  - If the types don't match, the clause is false. This is not an error.
- **Missing fields:**
  - Every comparison is false, except `is not` and `not in`.
  - `is not` and `not in` are defined as the negation of `is` and `in`, so they are true for a missing
    field. This means `status is not done` includes notes that have no status.
- **`has` / `exists`** are true when the field is present and is not `null`, an empty string or an
  empty array.

### Errors

A query that can't be parsed produces an error with a message and a 1-based column, for example
`Expected a value after "is" (column 10)`. The partial syntax tree is kept so the clause list can
show the clauses that did parse.

## Architecture

There are four units. Each has one job and a narrow interface.

### 1. Query engine (`src/query/`)

Pure TypeScript with no DOM or Quartz imports. It is bundled into the client script and unit-tested
directly.

- `lexer.ts`: `tokenize(input: string): Token[]`. Every token records its column.
- `parser.ts`: `parse(input: string): { ast: Expr | null; error: ParseError | null; clauses: Clause[] }`.
- `evaluate.ts`: `matches(ast: Expr, fields: NoteFields): boolean`.
- `format.ts`: `formatClause(clause): string`, which writes a clause back out in canonical text for
  the clause list.
- `types.ts`: the types `Token`, `Expr`, `Clause`, `ParseError` and `NoteFields`.

`NoteFields` is `Record<string, Scalar | Scalar[]>`, where `Scalar = string | number | boolean`.
Dates arrive as ISO strings. The evaluator recognises them by their format.

### 2. Index emitter: `FrontmatterIndex` (`src/emitter.ts`)

At build time it writes `static/quartz-filters/index.json`:

```json
{
  "version": 1,
  "notes": [{ "path": "electronics/h-bridge", "title": "H-bridge motor driver", "fields": {} }]
}
```

- It only sees content that passed Quartz's filters, so unpublished notes are never included.
- Values are normalized:
  - Strings, numbers and booleans are kept as they are.
  - `Date` values become ISO strings.
  - Arrays keep only their scalar elements.
  - `null` values and nested objects are dropped.
- **Option `excludeFields: string[]`** (default `[]`). These keys are dropped, matched
  case-insensitively.
- **Option `fields?: string[]`**. If it is set, only these keys are kept. `title` and `path` are
  always kept.
- The README warns that every frontmatter field on published notes becomes publicly readable unless
  it is excluded.

### 3. Panel component: `NoteFilter` (`src/components/NoteFilter.tsx`)

Preact markup rendered on the server:

- A tab list (`role="tablist"`) with **Filter** and **Saved (n)**.
- **Filter panel:**
  - The query input, a textarea that starts one line tall and grows. A syntax-highlight overlay sits behind it,
    so the caret and selection stay native.
  - The clause list.
  - A status line showing "N of M notes", a **Save** button and a **Clear** button.
  - An error line.
- **Saved panel:** the bookmark list, and an empty state that says "Save a filter to run it again
  later."
- Options:
  - `placeholder` (default `topic is "Electronics"`).
  - `indexPath` (default `static/quartz-filters/index.json`).
- Styles are in `src/components/styles/note-filter.scss`. They only use Quartz theme variables
  (`--light`, `--lightgray`, `--gray`, `--darkgray`, `--dark`, `--secondary`, `--tertiary`,
  `--highlight`, `--headerFont`, `--bodyFont`, `--codeFont`), so the panel follows the site's
  theme and dark mode.

#### Visual direction (approved mockup `explorer-v3.html`)

- The tabs are text labels with a 2px `--secondary` underline on the active tab. They are not boxed.
- The query uses the code font. Field names are `--secondary` and semibold, keywords are `--gray`,
  and values are `--tertiary` darkened for contrast.
- Each parsed clause in the clause list has a thin 2px `--tertiary` rule on its left. The joining
  `and`/`or` sits between clauses, with a `--lightgray` rule. Each clause has a × that removes it.
- The panel has no results list of its own.

### 4. Client script (`src/components/scripts/note-filter.inline.ts`)

It is split into small modules that are bundled together:

- **`index-loader`**
  - Fetches `indexPath`, resolved with `resolveBasePath` from `@quartz-community/utils/path`. This
    is the same helper the Explorer uses, so subpath deployments work.
  - The fetch starts lazily, the first time the input is focused or a bookmark is run. It also starts
    on page load if sessionStorage already holds a query.
  - The result is cached in memory for the session. A failed fetch can be retried.
- **`panel`**
  - Handles tab switching (arrow keys and Home/End, following the WAI-ARIA tabs pattern).
  - Re-runs the query on input, debounced at 150 ms, and re-renders the syntax highlight, clause list,
    status line and error.
  - The × on a clause removes that clause's text span from the query. The parser records a span for
    each clause, and the connective next to it is removed too.
- **`bookmarks`**
  - Bookmarks are stored as `[{ name, query }]` under the localStorage key
    `quartz-filters:bookmarks`.
  - **Save** asks for a name, using an inline input rather than `prompt()`. It suggests the query
    text as the name. If the name is already used, it asks before replacing.
  - Clicking a bookmark loads its query and switches to the Filter tab. The loaded bookmark is
    marked. × deletes a bookmark.
- **`explorer-sync`**
  - It applies the current match set to every `div.explorer`:
    - For each `.explorer-ul li` that holds a file link (`a.nav-file-title`), it compares the link's
      `href` attribute with `resolveBasePath(note.path)` for each matching note. Items that don't
      match get the class `qf-hidden`, which sets `display: none`.
    - Folders (`li` that contain `.folder-container`) with no visible descendant file are hidden. A
      folder that has visible descendants and isn't open gets `.open` added to its `.folder-outer`.
      The script records which folders it opened.
    - It sets `data-qf-filtered` on the `div.explorer`. CSS then shows a "Filtered" marker after
      `.title-button h2`.
  - Clearing the filter removes every `qf-hidden` class and the marker, and closes only the folders
    the script opened.
  - The Explorer redraws its tree asynchronously after `nav` and `render`. The script handles this
    with a `MutationObserver` on each `.explorer-ul` (childList and subtree), which re-applies the
    filter in a microtask. While it applies changes it ignores its own mutations, using a guard flag.
  - If the page has no `div.explorer`, the status line says "Add the Explorer plugin to filter
    notes." The match count is still shown.
  - If nothing matches, it shows the Explorer-level note "No notes match this filter.", with a
    **Clear filter** link inside `.explorer-content`.
- **Lifecycle**
  - On `nav`, the script binds to the new DOM and restores the query from sessionStorage
    (`quartz-filters:query`), so the filter survives navigation within the site.
  - It registers every listener and observer with `window.addCleanup`.

## Package changes

- The template's `ExampleTransformer`, `ExampleFilter`, `ExampleEmitter` and `ExampleComponent` are
  removed, together with their tests, styles, scripts, types and i18n keys.
- `src/index.ts` exports `FrontmatterIndex`, `NoteFilter` and the public option types.
- In the `package.json` `quartz` manifest:
  - `category` becomes `["emitter", "component"]`.
  - `defaultOptions` becomes `{ "excludeFields": [] }`.
  - The `optionSchema` describes `excludeFields` and `fields`.
  - `components` contains `NoteFilter`, with `defaultPosition: "left"`.
- New i18n strings go in `src/i18n/locales/en-US.ts`. These are the tab names, the status line,
  the errors and the empty states.
- The README is rewritten to cover installation, the query syntax with examples, the matching rules,
  the options and the privacy note about `excludeFields`.
- A changeset (minor) is added.
- `dist/` is rebuilt and committed.

## Error handling

| Situation                       | Behaviour                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| The query doesn't parse         | An inline error with its column. The Explorer keeps the last valid filter. Clauses that parsed are listed. |
| The index fails to load         | The status line says "Couldn't load filter data." The Explorer is unfiltered. It retries on next focus.    |
| The page has no Explorer        | The status line says "Add the Explorer plugin to filter notes." The count is still shown.                  |
| Nothing matches                 | The Explorer shows "No notes match this filter." and **Clear filter**.                                     |
| localStorage is unavailable     | The Saved tab says "Saving is off in this browser." Filtering still works.                                 |
| A bookmark name is already used | It asks "Replace the saved filter "name"?" and offers **Replace** and **Cancel**.                          |
| The query is empty              | No filter is applied, and the Explorer is restored.                                                        |

## Testing

All tests use Vitest. The DOM tests use `jsdom`, which is added as a dev dependency.

- **`query.test.ts`** has table-driven tests for:
  - every operator
  - precedence (`not` before `and` before `or`) and parentheses
  - case-insensitive keywords and field names
  - barewords next to keywords
  - array membership, and `is` on arrays
  - missing fields with `is not` and `not in`
  - ordering for numbers and dates, and mixed types evaluating to false
  - `has` with empty values
  - parse errors with their columns, and partial clause lists
- **`emitter.test.ts`** covers value normalization, Date to ISO, nested objects being dropped,
  `excludeFields`, the `fields` allowlist, and the built-in `title` and `path`.
- **`explorer-sync.test.ts`** uses markup copied from the Explorer's file and folder templates. It
  covers:
  - hiding non-matching files
  - hiding empty folders, and opening folders that contain matches
  - restoring the tree, including closing only the folders the script opened
  - re-applying the filter after the observer sees a redraw
  - the case where the page has no Explorer
- **`bookmarks.test.ts`** covers saving, replacing on a duplicate name, deleting, loading, and the
  case where localStorage throws.

## Risks

- **Explorer markup coupling.** `explorer-sync` depends on these selectors:
  - `div.explorer`
  - `.explorer-ul`
  - `a.nav-file-title`
  - `.folder-container`
  - `.folder-outer`
  - `.title-button h2`

  They are defined in one constants module and covered by the jsdom test, so a breaking Explorer
  release fails the tests in one place. A later improvement would be to ask the Explorer to add a
  filter hook upstream.

- **Size of the public index.** The index grows with the number of notes and fields. That's fine for
  personal gardens. `fields` exists as an allowlist for larger sites.
