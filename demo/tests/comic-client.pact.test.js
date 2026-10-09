/**
 * Demo: a complete Pact consumer test.
 *
 * One file, two interactions, no TODOs - this is what the finished product looks like.
 *
 * The shape of every Pact consumer test:
 *
 *   1. ARRANGE  describe what the provider owes you:
 *      .given(state)          -> what must exist on the provider first
 *      .uponReceiving(name)   -> which request you're talking about
 *      .withRequest({...})    -> exactly what you will send
 *      .willRespondWith({...})-> exactly what you need back
 *
 *   2. ACT      run your REAL client code against the mock server URL
 *
 *   3. ASSERT   check what your client made of the response
 *
 * executeTest() starts a mock HTTP server, runs your callback against it, checks that
 * your client actually sent the request you promised in step 1, and writes the pact
 * JSON file. All automatically.
 * NOTE: the response examples below are written with Matchers (integer/string/date).
 * Without matchers, an example is a promise about THAT EXACT VALUE - and any real
 * provider returning different data would fail verification. Exercise 3 explores
 * this in detail; here we use matchers from the start so the demo stays green.
 */

const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { ComicCatalogueClient } = require('../src/comic-client');

// Consumer + provider names define the pact file name: <consumer>-<provider>.json
const provider = new PactV3({
  consumer: 'MyConsumerApplication',
  provider: 'ComicCatalogue',
  dir: path.resolve(process.cwd(), 'demo', 'pacts'),
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
          id: MatchersV3.integer(1),
          title: MatchersV3.string('Barrel - Part 1'),
          publishedOn: MatchersV3.iso8601Date('1997-01-01'),
          imageUrl: MatchersV3.string('https://imgs.xkcd.com/comics/barrel_c_(part_1).png'),
          readCount: MatchersV3.integer(42),
        },
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const comic = await client.getComic(1);

      // These are ordinary unit-test assertions about OUR client's behaviour.
      expect(comic.title).toBe('Barrel - Part 1');
      expect(comic.publishedOn).toBe('1997-01-01');
    });
  });

  it('gets null when a comic does not exist', async () => {
    // A second interaction joins the SAME pact file (merge mode by default).
    // Contracts capture the sad paths too - "what do you do with a 404?" is part
    // of what the consumer needs from the provider.
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
      });

    await provider.executeTest(async (mock) => {
      const client = new ComicCatalogueClient(mock.url);
      const comic = await client.getComic(9999);

      expect(comic).toBeNull();
    });
  });
});
