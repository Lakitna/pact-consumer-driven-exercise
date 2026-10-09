/**
 * Exercise 3 - REFERENCE SOLUTION (instructor copy).
 *
 * Same interactions, now written as SHAPES instead of pinned values. Verification
 * against the provider's different data passes because every promise is about type,
 * format or structure - and the examples are just examples.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@jest/globals';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { ComicCatalogueClient } from '../src/comic-client.js';

// ESM equivalent of CJS's `__dirname`.
const dirname = path.dirname(fileURLToPath(import.meta.url));

const { integer, string, iso8601Date, eachLike, regex, number } = MatchersV3;

const provider = new PactV3({
  consumer: 'ReadingApp',
  provider: 'ComicCatalogue',
  dir: path.resolve(dirname, '..', 'pacts'),
});

describe('ReadingApp against the ComicCatalogue API (with matchers)', () => {
  it('shows the continue-reading shelf', async () => {
    provider
      .given('user ada has read 3 comics')
      .uponReceiving('a request for the continue-reading shelf')
      .withRequest({
        method: 'GET',
        path: '/api/users/ada/continue-reading',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        // The shelf may hold ANY number of comics, of ANY vintage, with ANY titles.
        // The consumer needs: an array of things shaped like this.
        body: eachLike({
          id: integer(7),
          title: string('Density'),
          publishedOn: iso8601Date('2003-04-11'),
          pagesRead: integer(3),
        }),
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const shelf = await client.getContinueReading('ada');

      // The mock replays the example, so unit assertions still work on examples.
      expect(shelf).toHaveLength(1);
      expect(shelf[0].title).toBe('Density');
    });
  });

  it('stores a rating', async () => {
    provider
      .given('comic 7 exists')
      .uponReceiving('a request to rate a comic')
      .withRequest({
        method: 'PUT',
        path: '/api/comics/7/rating',
        headers: { 'Content-Type': 'application/json' },
        // Even the REQUEST can be flexible: any whole number of stars 1-5.
        body: { stars: regex('[1-5]', 5) },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          // The provider echoes its stored float (5.5); the consumer only needs
          // "a number of stars", not this exact value or integer-ness.
          stars: number(4),
        },
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const result = await client.rateComic(7, 5);

      expect(result.stars).toBe(4);
    });
  });
});
