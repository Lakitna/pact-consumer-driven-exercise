/**
 * Exercise 1 - REFERENCE SOLUTION (instructor copy).
 *
 * This is what the filled-in skeleton should look like. Keep it out of the
 * attendee's way; use it to validate the exercise or for the wrap-up slide.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PactV3 } from '@pact-foundation/pact';
import { ComicCatalogueClient } from '../src/comic-client.js';

// ESM equivalent of CJS's `__dirname`.
const dirname = path.dirname(fileURLToPath(import.meta.url));

const provider = new PactV3({
  consumer: 'ReadingApp',
  provider: 'ComicCatalogue',
  dir: path.resolve(dirname, '..', 'pacts'),
});

describe('ReadingApp against the ComicCatalogue API', () => {
  it('can look up a comic issue', async () => {
    provider
      .given('comic 1 exists')
      .uponReceiving('a request for comic 1')
      .withRequest({
        method: 'GET',
        path: '/api/comics/1',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: 1,
          title: 'Barrel - Part 1',
          publishedOn: '1997-01-01',
          imageUrl: 'https://imgs.xkcd.com/comics/barrel_c_(part_1).png',
          readCount: 42,
        },
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const comic = await client.getComic(1);

      expect(comic.title).toBe('Barrel - Part 1');
    });
  });

  it('gets null when a comic does not exist', async () => {
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
      const comic = await client.getComic(9999);

      expect(comic).toBeNull();
    });
  });
});
