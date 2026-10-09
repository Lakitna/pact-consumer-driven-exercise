/**
 * Exercise 2 - REFERENCE SOLUTION (instructor copy).
 *
 * The pact updated to describe the provider that actually exists. Compare with
 * tests/comic-client.pact.test.js to see exactly what changed:
 *
 *   1. markAsRead now promises 200 (not 201)
 *   2. listComics now promises the { comics: [...], total } envelope
 *   3. the 404 body now promises RFC 7807 problem+json ({ status, title, detail })
 *      instead of the old { error } wish
 *
 * AND the client updated to match, because a contract you change without changing
 * your own code is a lie in a different font. See src/comic-client.solution.js for
 * the matching client; this test imports it. That two-sided edit IS the lesson:
 * when reality moves, contract and consumer code move together.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@jest/globals';
import { PactV3 } from '@pact-foundation/pact';
import { ComicCatalogueClient } from '../src/comic-client.solution.js';

// ESM equivalent of CJS's `__dirname`.
const dirname = path.dirname(fileURLToPath(import.meta.url));

const provider = new PactV3({
  consumer: 'ReadingApp',
  provider: 'ComicCatalogue',
  dir: path.resolve(dirname, '..', 'pacts'),
});

describe('ReadingApp against the ComicCatalogue API (updated)', () => {
  it('lists the newest comics', async () => {
    provider
      .given('there are comics published in 1997')
      .uponReceiving('a request for the first two comics')
      .withRequest({
        method: 'GET',
        path: '/api/comics',
        query: { limit: '2' },
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          comics: [
            { id: 1, title: 'Barrel - Part 1', publishedOn: '1997-01-01' },
            { id: 2, title: 'Pet Peeve', publishedOn: '1997-01-02' },
          ],
          total: 2,
        },
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const page = await client.listComics(2);

      expect(page.comics).toHaveLength(2);
      expect(page.total).toBe(2);
    });
  });

  it('marks a comic as read', async () => {
    provider
      .given('comic 1 exists with read count 42')
      .uponReceiving('a request to mark comic 1 as read')
      .withRequest({ method: 'POST', path: '/api/comics/1/read' })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { id: 1, readCount: 43 },
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const result = await client.markAsRead(1);

      expect(result.readCount).toBe(43);
    });
  });

  it('shows a message when a comic is missing', async () => {
    provider
      .given('comic 9999 does not exist')
      .uponReceiving('a request for a missing comic')
      .withRequest({
        method: 'GET',
        path: '/api/comics/9999',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 404,
        headers: { 'Content-Type': 'application/problem+json' },
        body: {
          status: 404,
          title: 'Comic not found',
          detail: 'No comic with number 9999',
        },
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const result = await client.getComic(9999);

      expect(result.notFound).toBe(true);
      expect(result.message).toBe('Comic not found');
    });
  });
});
