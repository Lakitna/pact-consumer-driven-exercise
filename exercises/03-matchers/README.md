# Exercise 3 - Matchers: promise the shape, not the data

The claim we are testing today:

> A contract that pins example values is a bomb with a long fuse. Matchers defuse it.

In exercises 1 and 2 you wrote exact values into `willRespondWith`, and in exercise 2 you
even _fixed_ a contract by matching reality exactly. This exercise shows why "exactly" is
the wrong goal almost every time.

## The setup

Your starter pact (`tests/comic-client.pact.test.js`) promises:

- a shelf containing **comic 7**, titled **'Density'**, published **2003-04-11** — exactly one item
- a rating response echoing **5** stars

The real provider (`provider/app.js`, read-only) is perfectly well-behaved: right routes,
right fields, right types. It just serves **different comics on a different day**, because
that's what databases do.

## 1. Watch a good provider fail

Two terminals for the provider side, one for the consumer tests:

```shell
npm run ex03:consumer:test    # consumer tests: green (against your own fantasy)
npm run ex03:provider:start   # terminal A: the real provider on port 9503
npm run ex03:provider:test    # terminal B: verification against it - RED
```

Read the failure report carefully. Nothing says "missing field" or "wrong type". It says
things like:

```plain
$.id -> Expected 101 (Integer) to be equal to 7 (Integer)
```

The provider did nothing _wrong_. Your contract demanded it role-play a specific comic.

## 2. Learn the tools

Matchers wrap an example value and replace the promise "exactly this" with a promise about
_this kind of thing_:

| Matcher                                                                            | Promise                                                                                               |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `MatchersV3.equal(5)`                                                              | exactly this value - the default when you write a bare literal (pinning is a choice, not an accident) |
| `MatchersV3.integer(7)`                                                            | any integer (example: 7)                                                                              |
| `MatchersV3.number(4.2)`                                                           | any number - integer or float                                                                         |
| `MatchersV3.string('x')`                                                           | any string                                                                                            |
| `MatchersV3.boolean()`                                                             | any boolean                                                                                           |
| `MatchersV3.iso8601Date(...)`                                                      | any string shaped `YYYY-MM-DD` (also `iso8601DateTime`, `rfc1123Timestamp`, ...)                      |
| `MatchersV3.regex('[1-5]', 5)`                                                     | any string/number matching your regex                                                                 |
| `MatchersV3.eachLike(item)`                                                        | array with ≥1 items, each matching `item`                                                             |
| `MatchersV3.atLeastOneLike(item)` / `atLeastLike(item, n)` / `atMostLike(item, n)` | arrays with explicit bounds                                                                           |

The house style for errors is RFC 7807: every error response is
`application/problem+json` with at least `{ status, title, detail }`. When you promise an
error response in a pact, set the `Content-Type` header to `application/problem+json` and
describe that body shape.

Import them once at the top of your test file:

```js
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { integer, string, iso8601Date, eachLike } = MatchersV3;
```

How matchers work under the hood: the pact JSON keeps your example as the _sample data_,
and records the rule separately in `matchingRules`. The mock replays the example to your
client; the verifier applies the RULE to whatever the provider returns. Open
`./pacts/ReadingApp-ComicCatalogue.json` after a run and find both halves.

## 3. Loosen the contract

Edit `tests/comic-client.pact.test.js`:

1. Shelf interaction: every field becomes a matcher; the array becomes `eachLike({...})`.
2. Rating interaction: the provider echoes its stored float (`5.5`) where you promised
   exactly `5` — replace it with a number matcher (`MatchersV3.number(...)`). Bonus: make
   the request body flexible too with `regex('[1-5]', 5)`.
3. Keep the Jest assertions sensible — the mock still answers with your examples, so
   `expect(shelf[0].title).toBe('Density')` remains true even though the _contract_ no
   longer demands it.

Loop until both commands are green (provider still running in terminal A):

```shell
npm run ex03:consumer:test
npm run ex03:provider:test
```

## 4. Feel the difference

Green now means something much stronger than in exercise 2:

- Exercise 2's green: "the provider returns precisely these bytes." Fragile — breaks on
  every data change, every new comic, every counter increment.
- Exercise 3's green: "whatever the provider returns, my app can rely on its structure."
  That is an actual agreement two teams can live with.

This is the core skill of consumer-driven contracts: **write down only what you need.**
Every extra pinned value is a future false alarm; every missing matcher is a production
surprise.

## Reference solution

`./solution/` has the loosened pact. Run it with:

```shell
npm run ex03:consumer:solution   # consumer tests against the matcher-based contract
npm run ex03:provider:test       # verification of that pact - green (provider still running)
```

Peek only when you're done.
