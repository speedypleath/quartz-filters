---
"@speedypleath/quartz-filters": minor
---

Add the Note Filter. Readers filter the Explorer by frontmatter with plain-words queries such as `topic is "Electronics" and "seedling" in tags`, toggle Match case, and save filters in their browser. A new `FrontmatterIndex` emitter writes the data to `static/quartz-filters/index.json`. Use `excludeFields` to keep fields private. This replaces the template's example plugins.
