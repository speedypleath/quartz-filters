import { QuartzEmitterPlugin } from '@quartz-community/types';
export { PageGenerator, PageMatcher, QuartzComponent, QuartzComponentConstructor, QuartzComponentProps, QuartzEmitterPlugin, QuartzFilterPlugin, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzTransformerPlugin, StringResource, VirtualPage } from '@quartz-community/types';
export { NoteFilter, NoteFilterOptions } from './components/index.js';

interface FrontmatterIndexOptions {
    /** Frontmatter keys to leave out of the public index. Matched regardless of case. */
    excludeFields: string[];
    /** When set, only these keys are indexed. `title` and `path` are always included. */
    fields?: string[];
}
/** Writes every published note's frontmatter to `static/quartz-filters/index.json`. */
declare const FrontmatterIndex: QuartzEmitterPlugin<Partial<FrontmatterIndexOptions>>;

export { FrontmatterIndex, type FrontmatterIndexOptions };
