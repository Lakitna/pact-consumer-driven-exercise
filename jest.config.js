/**
 * Jest configuration for the Pact consumer-side training exercises.
 *
 * - testEnvironment: 'node'  -> Pact uses native bindings; jsdom would break them.
 * - transform              -> @swc/jest compiles ESM syntax (import.meta, top-level
 *                             imports) to CJS so Jest's sandboxed module runtime can
 *                             load the tests without the full --experimental-vm-modules setup.
 * - testTimeout             -> mock server startup can take a few seconds.
 * - resetMocks: false       -> don't let Jest clear Pact's internals between tests.
 */
export default {
  testEnvironment: 'node',
  testTimeout: 30000,
  resetMocks: false,
  transform: {
    '^.+\\.m?js$': '@swc/jest',
  },
  testMatch: ['**/tests/**/*.test.js', '**/solution/**/*.test.js'],
};
