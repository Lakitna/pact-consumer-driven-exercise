/**
 * Exercise 1 - your first pact.
 *
 * GOAL: fill in the TODOs below, run `npm run ex01:consumer:test` from the repo root until green,
 * then open ./pacts/ReadingApp-ComicCatalogue.json and find every piece you wrote.
 *
 * Every Pact consumer interaction has four parts. Read them as a sentence:
 *
 *   given(some state)                  "the provider is in a situation where ..."
 *   uponReceiving(a request)           "... and it receives this kind of request ..."
 *   withRequest({...})                 "... which looks exactly like this ..."
 *   willRespondWith({...})             "... then it must answer exactly like this."
 *
 * The mock server Pact starts for you ONLY knows what you write here. If your client
 * sends something different from `withRequest`, the mock answers 500 and the test fails.
 * That's not a bug - that's the contract being enforced on YOUR side of the fence.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PactV3 } from '@pact-foundation/pact';
import { ComicCatalogueClient } from '../src/comic-client.js';

// ESM equivalent of CJS's `__dirname`.
const dirname = path.dirname(fileURLToPath(import.meta.url));

// Consumer + provider names define the pact file name: <consumer>-<provider>.json
const provider = new PactV3({
  consumer: 'ReadingApp',
  provider: 'ComicCatalogue',
  dir: path.resolve(dirname, '..', 'pacts'),
});

describe('ReadingApp against the ComicCatalogue API', () => {
  it('can look up a comic issue', async () => {
    // TODO 1: the provider needs to be told what to prepare before the request
    // arrives. For this interaction, the provider should have a comic with number 1.
    //
    // Describe it in plain words - any string works, but the provider team must be
    // able to read it and implement the setup. Suggestion: 'comic 1 exists'
    provider.given(/* FILL IN */);

    // TODO 2: name this interaction. Keep it unique within the pact; it ends up in
    // the JSON as "description" and shows up in verification reports.
    provider.uponReceiving(/* FILL IN */);

    // TODO 3: describe the request your client WILL send.
    // Look at getComic() in ../src/comic-client.js and copy reality:
    //   - method?  - path for comic number 1?  - which headers does it set?
    provider.withRequest({
      // FILL IN
    });

    // TODO 4: describe the response your client NEEDS.
    // A comic looks like this (exact values are fine for exercise 1 - we loosen
    // them with matchers in exercise 3):
    //   {
    //     id: 1,
    //     title: 'Barrel - Part 1',
    //     publishedOn: '1997-01-01',
    //     imageUrl: 'https://imgs.xkcd.com/comics/barrel_c_(part_1).png',
    //     readCount: 42,
    //   }
    // Status: 200. Content-Type: application/json.
    provider.willRespondWith({
      // FILL IN
    });

    // TODO 5: wire your real client to the mock and assert on the result.
    // `mock.url` is the address of the throwaway mock server Pact started.
    // Create a ComicCatalogueClient pointed at it, fetch comic 1, and expect
    // the title to be 'Barrel - Part 1'.
    await provider.executeTest(async (mock) => {
      const cata = new ComicCatalogueClient(mock.url);
      const comic = await cata.getComic(1);

      // FILL IN
    });
  });

  it('gets null when a comic does not exist', async () => {
    // TODO 6: do it yourself, no scaffolding this time.
    // The client returns null when the provider answers 404. Write the interaction:
    //   given:   'comic 9999 does not exist'
    //   request: GET /api/comics/9999 with the Accept header your client sends
    //   response: 404, body { status: 404, title: 'Comic not found', detail: '...' }
    //   (house style: every error is RFC 7807 problem+json - Content-Type
    //    application/problem+json)
    // Then in executeTest: call client.getComic(9999) and expect it to be null.
    //
    // Hint: interactions stack up in ONE pact file - both tests above end up in
    // the same JSON. Contracts capture the sad paths too.
    //
    // FILL IN EVERYTHING BELOW
    await provider.executeTest(async (mock) => {
      throw new Error('TODO 6 not implemented yet');
    });
  });
});
