import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'https://esm.sh/ajv@8.17.1/dist/2020.js': 'ajv/dist/2020',
      'https://esm.sh/ajv-formats@3.0.1': 'ajv-formats',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['js/**/*.js'],
    },
  },
});
