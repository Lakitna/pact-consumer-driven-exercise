/**
 * Exercise 3 - THE REAL PROVIDER. READ-ONLY FOR ATTENDEES.
 *
 * A perfectly reasonable provider: correct endpoints, correct field names, correct
 * status codes, correct types. It simply returns DIFFERENT DATA than the examples in
 * your pact - different comics, different dates, different counts. Which is exactly
 * what a real database does.
 *
 * Runs in its OWN terminal: `npm run ex03:provider:start` (port 9503). Watch requests stream by
 * while `npm run ex03:provider:test` replays the contract against it.
 *
 * House style: every error response is RFC 7807 application/problem+json.
 */

const express = require('express');

const app = express();
app.use(express.json()); // parses the JSON body of POST /_pactSetup state calls

/** Build an RFC 7807 problem+json response (house style for ALL errors). */
function problem(status, title, detail) {
  return { status, title, detail };
}

// The "database" used during verification. Note it shares NO values with the
// exact examples written in the starter pact (id 7, 'Density', '2003-04-11', ...).
let shelfByUser = new Map([
  [
    'ada',
    [
      { id: 101, title: 'Island of Shiny Metal', publishedOn: '2005-09-19', pagesRead: 2 },
      { id: 102, title: 'Diet Coke and Mentos', publishedOn: '2006-08-14', pagesRead: 5 },
      { id: 103, title: 'Blag Flag', publishedOn: '2004-06-16', pagesRead: 1 },
    ],
  ],
]);

let ratings = new Map();

app.get('/api/users/:userId/continue-reading', (req, res) => {
  const shelf = shelfByUser.get(req.params.userId) ?? [];
  res.json(shelf);
});

app.put('/api/comics/:id/rating', (req, res) => {
  const stars = Number(req.body?.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res
      .status(422)
      .type('application/problem+json')
      .json(problem(422, 'Invalid rating', 'stars must be an integer between 1 and 5'));
  }
  ratings.set(Number(req.params.id), stars);
  // The provider stores the rating as a float in its database, so it echoes
  // 5.5 where the consumer promised exactly 5 - same meaning, different JSON
  // value. A type mismatch waiting to happen.
  res.json({ stars: Number.parseFloat(`${stars}.5`) });
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

  if (state === 'user ada has read 3 comics') {
    shelfByUser = new Map([
      [
        'ada',
        [
          { id: 101, title: 'Island of Shiny Metal', publishedOn: '2005-09-19', pagesRead: 2 },
          { id: 102, title: 'Diet Coke and Mentos', publishedOn: '2006-08-14', pagesRead: 5 },
          { id: 103, title: 'Blag Flag', publishedOn: '2004-06-16', pagesRead: 1 },
        ],
      ],
    ]);
  } else if (state === 'comic 7 exists') {
    // Nothing to arrange; the provider accepts ratings for any comic number.
  }
  res.status(200).json({ ok: true });
});

const PORT = 9503;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ComicCatalogue provider listening on http://127.0.0.1:${PORT}`);
  });
}

module.exports = app;
