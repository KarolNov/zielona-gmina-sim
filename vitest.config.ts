import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // run in Node environment for this repo's unit tests
    environment: 'node',
    globals: true,
    deps: {
      // inline tiny-warning (CJS) to avoid ReferenceError in worker runtime
      inline: ['tiny-warning'],
    },
  },
});
