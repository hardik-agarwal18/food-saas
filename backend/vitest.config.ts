import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    /**
     * Run test files sequentially to avoid database race conditions.
     */
    fileParallelism: false,

    /**
     * Makes Vitest APIs such as `describe`, `it`, and `expect`
     * available globally without importing them in every test file.
     */
    globals: true,

    /**
     * Use the Node.js test environment because this is a backend
     * application rather than a browser-based application.
     */
    environment: 'node',

    /**
     * Runs shared test setup before the test files are executed.
     *
     * This file can contain environment setup, mocks, database
     * initialization, or common test utilities.
     */
    setupFiles: ['./tests/setup.ts'],

    /**
     * Finds all test files inside the `tests` directory.
     */
    include: ['tests/**/*.test.ts'],

    /**
     * Excludes dependencies, build output, and generated files
     * from test discovery.
     */
    exclude: ['node_modules', 'dist', 'generated'],

    /**
     * Clears mock call history between tests.
     *
     * This prevents one test's mock calls from affecting another test.
     */
    clearMocks: true,

    /**
     * Restores mocked functions to their original implementations
     * between tests.
     */
    restoreMocks: true,

    /**
     * Maximum time allowed for an individual test.
     *
     * Thirty seconds is useful for integration tests involving
     * databases, Redis, or other infrastructure.
     */
    testTimeout: 30_000,

    /**
     * Maximum time allowed for test hooks such as `beforeAll`,
     * `beforeEach`, `afterAll`, and `afterEach`.
     */
    hookTimeout: 30_000,
  },
});
