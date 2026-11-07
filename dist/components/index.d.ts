import { QuartzComponent } from '@quartz-community/types';

interface NoteFilterOptions {
    /** Example query shown in the empty input. */
    placeholder?: string;
    /** Whether "Match case" starts switched on. Readers can still flip it. */
    caseSensitive?: boolean;
}
declare const _default: (opts?: NoteFilterOptions) => QuartzComponent;

export { _default as NoteFilter, type NoteFilterOptions };
