/**
 * Exercise 3 - provider verification. Same shape as exercise 2's verifier.
 * Two terminals:
 *
 *   terminal A:  npm run ex03:provider:start     (provider on http://127.0.0.1:9503)
 *   terminal B:  npm run ex03:provider:test      (this script)
 */

const path = require('path');
const { Verifier } = require('@pact-foundation/pact');

const PROVIDER_URL = 'http://127.0.0.1:9503';

const pactFile = path.resolve(
  process.cwd(),
  'exercises',
  '03-matchers',
  'pacts',
  'ReadingApp-ComicCatalogue.json',
);

new Verifier({
  provider: 'ComicCatalogue',
  providerBaseUrl: PROVIDER_URL,
  pactUrls: [pactFile],
  providerStatesSetupUrl: `${PROVIDER_URL}/_pactSetup`,
  logLevel: 'info',
})
  .verifyProvider()
  .then(() => {
    console.log('\nVERIFICATION PASSED: the provider keeps every promise in the pact.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nVERIFICATION FAILED:', err.message);
    process.exit(1);
  });
