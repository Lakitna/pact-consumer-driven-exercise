/**
 * Exercise 2 - the pact, written from the consumer's point of view.
 *
 * These tests are COMPLETE and they PASS. That is not a spoiler - that's the setup.
 * The mock gives you exactly what you asked for, so your client works perfectly...
 * against a fantasy provider. Reality checks come later.
 *
 * DON'T change this file yet. Run it, keep the pact it writes, then verify against
 * the real provider (see README). When verification fails, THIS file is where the
 * fix goes - because the contract says what the consumer needs, and right now it
 * describes a provider that does not exist.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@jest/globals';
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
        contentType: 'application/json',
        body: [
          {
            id: 1,
            title: 'Barrel - Part 1',
            publishedOn: '1997-01-01',
          },
          {
            id: 2,
            title: 'Pet Peeve',
            publishedOn: '1997-01-02',
          },
        ],
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const comics = await client.listComics(2);

      expect(comics).toHaveLength(2);
      expect(comics[0].title).toBe('Barrel - Part 1');
    });
  });

  it('marks a comic as read', async () => {
    provider
      .given('comic 1 exists with read count 42')
      .uponReceiving('a request to mark comic 1 as read')
      .withRequest({
        method: 'POST',
        path: '/api/comics/1/read',
      })
      .willRespondWith({
        status: 201,
        contentType: 'application/json',
        body: {
          id: 1,
          readCount: 43,
        },
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
        contentType: 'application/json',
        body: {
          error: 'not found',
        },
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const result = await client.getComic(9999);

      expect(result.notFound).toBe(true);
      expect(result.message).toBe('not found');
    });
  });
});
