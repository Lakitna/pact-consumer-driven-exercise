/**
 * Exercise 3 - the exact-value trap.
 *
 * These consumer tests are COMPLETE and PASS. The pact they write, however, promises
 * very specific data: comic number 7, published on 2003-04-11, exactly one item on the
 * shelf, rating 5.
 *
 * Run `npm run ex03:provider:test` and watch a perfectly working provider fail verification on
 * every single interaction - not because it breaks the agreement, but because there
 * was never really an agreement about DATA, only about SHAPE. Your job is to rewrite
 * the promises as shapes (matchers) so the contract says what the consumer needs and
 * stays quiet about what it doesn't care about.
 */

const path = require('path');
const { PactV3 } = require('@pact-foundation/pact');
const { ComicCatalogueClient } = require('../src/comic-client');

const provider = new PactV3({
  consumer: 'ReadingApp',
  provider: 'ComicCatalogue',
  dir: path.resolve(process.cwd(), 'exercises', '03-matchers', 'pacts'),
});

describe('ReadingApp against the ComicCatalogue API', () => {
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
        // EXACT VALUES - this is the problem. Every field below pins reality:
        body: [
          {
            id: 7,
            title: 'Density',
            publishedOn: '2003-04-11',
            pagesRead: 3,
          },
        ],
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const shelf = await client.getContinueReading('ada');

      expect(shelf).toHaveLength(1);
      expect(shelf[0].title).toBe('Density');
    });
  });

  it('stores a rating', async () => {
    provider
      .given('comic 7 exists')
      .uponReceiving('a request to rate comic 7 with 5 stars')
      .withRequest({
        method: 'PUT',
        path: '/api/comics/7/rating',
        headers: { 'Content-Type': 'application/json' },
        // EXACT BODY - no matcher here either. Bonus TODO: loosen this too, and
        // note what the provider answers below.
        body: { stars: 5 },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          stars: 5,
        },
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const result = await client.rateComic(7, 5);

      expect(result.stars).toBe(5);
    });
  });
});
