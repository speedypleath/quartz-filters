# Quartz Filters

Filter the [Explorer](https://quartz.jzhao.xyz/plugins/explorer) by frontmatter, in plain words,
and save the filters you use often.

```
topic is "Electronics" and "seedling" in tags
```

Readers type a query in the sidebar and the Explorer shows only the notes that match. Nothing is
rebuilt, and nothing leaves the reader's browser.

## Install

The panel filters the Explorer, so install both:

```bash
npx quartz plugin add github:quartz-community/explorer
npx quartz plugin add github:speedypleath/quartz-filters
```

```yaml
plugins:
  - source: github:quartz-community/explorer
    enabled: true
  - source: github:speedypleath/quartz-filters
    enabled: true
    options:
      excludeFields: [email, private-notes]
    layout:
      position: left
      priority: 40
```

`npx quartz plugin add` writes the `layout` block for you. If you edit the entry by hand, keep it:
without `layout`, Quartz still builds the index but doesn't place the panel. Priority 40 puts the
panel above the Explorer (50).

> [!warning]
> Every frontmatter field of every published note is written to a public file,
> `static/quartz-filters/index.json`, so the browser can filter without a server. Use
> `excludeFields` (or the `fields` allowlist) for anything you don't want readable.

## Writing a filter

| Clause                                 | Example                  |
| -------------------------------------- | ------------------------ |
| `field is value`, `field is not value` | `topic is "Electronics"` |
| `value in field`, `value not in field` | `"seedling" in tags`     |
| `field contains value`                 | `title contains motor`   |
| `field < > <= >= value`                | `created >= 2026-01-01`  |
| `has field`, `field exists`            | `has status`             |

- **Combining clauses:** use `and`, `or`, `not` and parentheses. `not` binds tightest, then `and`,
  then `or`:

  ```
  topic is Electronics and ("seedling" in tags or status is not done)
  ```

- **Values:**
  - Values can be `"quoted text"`, numbers, dates (`2026-01-01`, or `2026-01-01T10:30`) or
    `true`/`false`.
  - A single word doesn't need quotes, and neither does a path such as `electronics/h-bridge`.
    Quote a value if it has spaces or other punctuation, or if it is a keyword (`is`, `not`, `in`,
    `and`, `or`, `has`, `exists`, `contains`).
- **Fields:** any frontmatter key works. `title` and `path` (the note's slug) are always available.

### How values match

- **Match case:** with the **Aa** toggle off (the default), text and field names match regardless
  of case. Switch it on to require exact case. Keywords, numbers, dates and booleans are never
  affected.
- **Lists:** if a field is a list, a clause matches when any item matches. `tags is seedling` and
  `seedling in tags` mean the same thing.
- **Dates:** a date without a time matches the whole day. `created is 2026-01-01` matches a note
  created at any time that day.
- **Comparisons:** `<`, `>`, `<=` and `>=` only compare numbers with numbers and dates with dates.
  Anything else doesn't match.
- **Missing fields:** a missing field never matches, except with `is not` and `not in`.
  `status is not done` includes notes that have no `status`.

## Saved filters

Click **Save** to keep the current filter under a name. Saved filters appear in the **Saved** tab
and remember their Match case setting.

They live in the reader's browser (localStorage), so each reader has their own. If the browser
blocks storage, as some private modes do, filtering still works but saving is off.

## Options

| Option          | Type       | Default                  | Used by | Description                                                         |
| --------------- | ---------- | ------------------------ | ------- | ------------------------------------------------------------------- |
| `excludeFields` | `string[]` | `[]`                     | index   | Frontmatter keys to leave out of the public index (any case).       |
| `fields`        | `string[]` | all fields               | index   | If set, only these keys are indexed. `title` and `path` always are. |
| `placeholder`   | `string`   | `topic is "Electronics"` | panel   | Example query shown in the empty input.                             |
| `caseSensitive` | `boolean`  | `false`                  | panel   | Whether **Aa** starts switched on. Readers can still flip it.       |

For advanced use in `quartz.ts`:

```ts
import * as ExternalPlugin from "./.quartz/plugins";

ExternalPlugin.FrontmatterIndex({ excludeFields: ["email"] });
ExternalPlugin.NoteFilter({ caseSensitive: true });
```

## Development

```bash
npm install
npm run check   # typecheck, lint, format, tests
npm run build   # rebuilds dist/, which is committed
```

> [!important]
> Commit the rebuilt `dist/` with your changes. Quartz installs plugins from it.

Releases use [Changesets](https://github.com/changesets/changesets). Run `npx changeset`, commit the
file, and merging the release PR publishes to npm.

## License

MIT
