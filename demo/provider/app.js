/**
 * Demo provider: a real Express implementation of the Comic Catalogue API.
 *
 * Runs in its OWN terminal (`npm run demo:provider:start`, port 9500) - separate from both
 * the consumer tests and the verifier, so participants can watch requests stream by.
 *
 * Deliberately returns DIFFERENT data than the examples written in the pact
 * (different title, different date, different read count). The consumer test
 * passed against the mock - and verification still passes against this real
 * provider, because the contract only promises the *shape*, not these values.
 *
 * This is the demo's punchline: contracts are agreements about structure,
 * not about specific data.
 *
 * House style: every error response is RFC 7807 application/problem+json.
 */

const express = require('express');

// In-memory "database". Note how it differs from the pact's example values.
const comics = new Map([
  [
    1,
    {
      id: 1,
      title: 'Pet Peeve',
      publishedOn: '2001-09-05',
      imageUrl: 'https://imgs.xkcd.com/comics/pet_peeve.png',
      readCount: 7,
    },
  ],
]);

const app = express();

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(
      `[${new Date().toUTCString()}] ` +
        `"${req.method} ${req.originalUrl} HTTP/${req.httpVersion}" ${res.statusCode}`,
    );
  });
  next();
});

app.use(express.json());

function problem(status, title, detail) {
  return { status, title, detail };
}

app.get('/api/comics/:id', (req, res) => {
  const comic = comics.get(Number(req.params.id));
  if (!comic) {
    return res
      .status(404)
      .type('application/problem+json')
      .json(problem(404, 'Comic not found', `No comic with number ${req.params.id}`));
  }
  res.json(comic);
});

app.post('/api/comics/:id/read', (req, res) => {
  const comic = comics.get(Number(req.params.id));
  if (!comic) {
    return res
      .status(404)
      .type('application/problem+json')
      .json(problem(404, 'Comic not found', `No comic with number ${req.params.id}`));
  }
  comic.readCount += 1;
  res.status(201).json({ id: comic.id, readCount: comic.readCount });
});

// Anything else that looks like API traffic also answers in problem+json -
// consistency is part of the house style.
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
  // `req.body` is undefined when the request carries no body at all (e.g. a POST with
  // neither Content-Type nor payload), so default it before destructuring the state name.
  const { state } = req.body ?? {};
  console.log(`[Pact Setup] setting up: ${state}`);

  if (state === 'comic 1 exists') {
    // Deliberately NOT the data from the pact example: same shape, different values.
    comics.set(1, {
      id: 1,
      title: 'Barrel - Part 2',
      publishedOn: '1997-02-14',
      imageUrl: 'https://imgs.xkcd.com/comics/barrel_c_(part_2).png',
      readCount: 128,
    });
  } else if (state === 'comic 9999 does not exist') {
    comics.delete(9999);
  }
  // Unknown states succeed anyway so they never block verification in the demo.
  res.status(200).json({ ok: true });
});

const PORT = 9500;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ComicCatalogue provider listening on http://127.0.0.1:${PORT}`);
  });
}

module.exports = app;
