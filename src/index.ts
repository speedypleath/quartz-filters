export { FrontmatterIndex } from "./emitter";
export type { FrontmatterIndexOptions } from "./emitter";
export { default as NoteFilter } from "./components/NoteFilter";
export type { NoteFilterOptions } from "./components/NoteFilter";

// Re-export shared types from @quartz-community/types
export type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
  StringResource,
  QuartzTransformerPlugin,
  QuartzFilterPlugin,
  QuartzEmitterPlugin,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
  PageMatcher,
  PageGenerator,
  VirtualPage,
} from "@quartz-community/types";
