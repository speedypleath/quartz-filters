---
"@speedypleath/quartz-filters": patch
---

Properties that hold Obsidian links, such as `topics: ["[[Programming]]"]`, are now indexed as the text Obsidian shows (`Programming`), so `Programming in topics` matches. A link with an alias (`[[Electronics|Hardware]]`) is indexed as its alias.
