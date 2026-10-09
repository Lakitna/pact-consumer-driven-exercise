/**
 * Exercise 2 - THE REAL PROVIDER.
 *
 * +-----------------------------------------------------------------------------+
 * | THIS FILE IS READ-ONLY FOR ATTENDEES.                                       |
 * | The provider team deployed this version last week. Your job is NOT to fix   |
 * | it - it's to decide what the CONTRACT should say, and update the consumer    |
 * | test accordingly. Editing the provider "makes verification green" but        |
 * | destroys the point of the exercise (and in real life, you can't deploy       |
 * | another team's service).                                                     |
 * +-----------------------------------------------------------------------------+
 *
 * Runs in its OWN terminal: `npm run ex02:provider:start` (port 9502). Watch requests stream by
 * while `npm run ex02:provider:test` replays the contract against it.
 *
 * Where reality differs from the pact the consumer wrote:
 *
 *   1. POST /api/comics/:id/read answers 200, not 201
 *   2. GET /api/comics returns { comics: [...], total: N } - an envelope, not a bare array
 *   3. errors are RFC 7807 problem+json ({ status, title, detail }), while the old
 *      pact still promises a plain body with just { error }
 */

import express from 'express';

const app = express();
app.use(express.json()); // parses the JSON body of POST /_pactSetup state calls

/** Build an RFC 7807 problem+json response (house style for ALL errors). */
function problem(status, title, detail) {
  return { status, title, detail };
}

const notFound = (req) => problem(404, 'Comic not found', `No comic with number ${req.params.id}`);

const comics = new Map([
  [1, { id: 1, title: 'Barrel - Part 1', publishedOn: '1997-01-01', readCount: 42 }],
  [2, { id: 2, title: 'Pet Peeve', publishedOn: '1997-01-02', readCount: 7 }],
]);

// 1. List comics - inside an envelope (deviation #2)
app.get('/api/comics', (req, res) => {
  const limit = Number(req.query.limit ?? 10);
  const page = [...comics.values()].slice(0, limit);
  res.json({ comics: page, total: comics.size });
});

// 3. Single comic - 404 answers problem+json (deviation #3)
app.get('/api/comics/:id', (req, res) => {
  const comic = comics.get(Number(req.params.id));
  if (!comic) {
    return res.status(404).type('application/problem+json').json(notFound(req));
  }
  res.json(comic);
});

// 2. Mark as read - answers 200 (deviation #1)
app.post('/api/comics/:id/read', (req, res) => {
  const comic = comics.get(Number(req.params.id));
  if (!comic) {
    return res.status(404).type('application/problem+json').json(notFound(req));
  }
  comic.readCount += 1;
  res.status(200).json({ id: comic.id, readCount: comic.readCount });
});

// House style: any other /api traffic gets a problem+json 404 too.
app.use('/api', (req, res) => {
  res
    .status(404)
    .type('application/problem+json')
    .json(problem(404, 'Not Found', `Cannot ${req.method} ${req.path}`));
});

/**
 * Provider states: before verifying an interaction, the Pact verifier POSTs the
 * `given(...)` name to this endpoint (see providerStatesSetupUrl in verify.js),
 * so the provider can arrange what the contract asks for. This is scaffolding for
 * contract verification - not part of the real API.
 */
app.post('/_pactSetup', (req, res) => {
  const { state } = req.body;
  console.log(`[provider-state] setting up: ${state}`);

  if (state === 'there are comics published in 1997') {
    comics.set(1, { id: 1, title: 'Barrel - Part 1', publishedOn: '1997-01-01', readCount: 42 });
    comics.set(2, { id: 2, title: 'Pet Peeve', publishedOn: '1997-01-02', readCount: 7 });
  } else if (state === 'comic 1 exists with read count 42') {
    comics.set(1, { id: 1, title: 'Barrel - Part 1', publishedOn: '1997-01-01', readCount: 42 });
  } else if (state === 'comic 9999 does not exist') {
    comics.delete(9999);
  }
  res.status(200).json({ ok: true });
});

const PORT = 9502;

// ESM equivalent of CJS's `require.main === module`: only listen when run directly.
if (process.argv[1] === import.meta.filename) {
  app.listen(PORT, () => {
    console.log(`ComicCatalogue provider listening on http://127.0.0.1:${PORT}`);
  });
}

export default app;
