/**
 * Demo: provider verification.
 *
 * Takes the pact file the consumer tests wrote and replays its expectations as real
 * HTTP requests against a running provider. This is the other half of the contract:
 * "provider, do you actually keep the promises written in this file?"
 *
 * The provider runs in its OWN terminal - start it first, then verify here:
 *
 *   terminal A:  npm run demo:provider:start     (provider on http://127.0.0.1:9500)
 *   terminal B:  npm run demo:provider:test      (this script)
 */

const path = require('path');
const { Verifier } = require('@pact-foundation/pact');

const PROVIDER_URL = 'http://127.0.0.1:9500';

const pactFile = path.resolve(
  process.cwd(),
  'demo',
  'pacts',
  'MyConsumerApplication-ComicCatalogue.json',
);

new Verifier({
  // Who we are, for the report output
  provider: 'ComicCatalogue',
  // Where the already-running provider lives
  providerBaseUrl: PROVIDER_URL,
  // The contract(s) to verify - local files, no broker needed for training
  pactUrls: [pactFile],
  // How to arrange each `given(...)` state before replaying an interaction:
  // the provider exposes POST /_pactSetup for exactly this purpose.
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
