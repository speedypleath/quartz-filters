import { h, render, type FunctionComponent } from "preact";
import type { QuartzComponent } from "@quartz-community/types";

/** Renders a Quartz component into `container` with a minimal `cfg`. */
export function renderComponent(
  component: QuartzComponent,
  container: HTMLElement,
  props: Record<string, unknown> = {},
): void {
  const Component = component as unknown as FunctionComponent<Record<string, unknown>>;
  render(h(Component, { cfg: { locale: "en-US" }, ...props }), container);
}
