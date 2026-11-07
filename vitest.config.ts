import { defineConfig } from "vitest/config";

const STUB_PREFIX = "\0quartz-asset-stub:";

export default defineConfig({
  plugins: [
    {
      // tsup turns .scss and .inline.ts imports into strings; tests load them as empty strings.
      name: "quartz-asset-stubs",
      enforce: "pre",
      resolveId(source) {
        return /\.scss$|\.inline\.ts$/.test(source) ? STUB_PREFIX + source : null;
      },
      load(id) {
        return id.startsWith(STUB_PREFIX) ? "export default ''" : null;
      },
    },
  ],
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    reporters: ["default"],
  },
});
