# Changelog

## 0.2.0

### Minor Changes

- ccb2f1c: Add the Note Filter. Readers filter the Explorer by frontmatter with plain-words queries such as `topic is "Electronics" and "seedling" in tags`, toggle Match case, and save filters in their browser. A new `FrontmatterIndex` emitter writes the data to `static/quartz-filters/index.json`. Use `excludeFields` to keep fields private. This replaces the template's example plugins.

## 0.1.1

### Patch Changes

- 792add2: Stop bundling `preact` and the other `SINGLETON_EXTERNALS`. tsup checks `noExternal` first, so `noExternal: [/.*/]` overrode them, and every plugin built from the template shipped its own copy of Preact.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial Quartz community plugin template.
