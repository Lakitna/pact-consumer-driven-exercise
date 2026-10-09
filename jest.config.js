/**
 * Jest configuration for the Pact consumer-side training exercises.
 *
 * - testEnvironment: 'node'  -> Pact uses native bindings; jsdom would break them.
 * - testTimeout             -> mock server startup can take a few seconds.
 * - resetMocks: false       -> don't let Jest clear Pact's internals between tests.
 */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  resetMocks: false,
  testMatch: ['**/tests/**/*.test.js', '**/solution/**/*.test.js'],
};
