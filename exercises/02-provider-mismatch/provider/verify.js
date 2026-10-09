/**
 * Exercise 2 - provider verification.
 *
 * Replays the pact as real HTTP requests against the ALREADY-RUNNING provider and
 * reports every promise the provider breaks. Two terminals:
 *
 *   terminal A:  npm run ex02:provider:start     (provider on http://127.0.0.1:9502)
 *   terminal B:  npm run ex02:provider:test      (this script)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Verifier } from '@pact-foundation/pact';

const PROVIDER_URL = 'http://127.0.0.1:9502';

// ESM equivalent of CJS's `__dirname`.
const dirname = path.dirname(fileURLToPath(import.meta.url));
const pactFile = path.resolve(dirname, '..', 'pacts', 'ReadingApp-ComicCatalogue.json');

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
