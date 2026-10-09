# Exercise 1 - Your first pact

The claim we are testing today:

> A Pact consumer test is a unit test that writes your contract for you.

In this folder you find a small client (`src/comic-client.js`) for the fictional **Comic
Book Catalogue API**. The real API does not exist yet, and that's exactly the point: you
will describe what you need from it, and Pact will build a mock that behaves accordingly.

## What you will do

1. Fill in the TODOs in `tests/comic-client.pact.test.js`
2. Run the test until green
3. Open the generated contract and recognize what you wrote

## 1. Fill in the skeleton

Open `tests/comic-client.pact.test.js`. Six TODOs, each with an explainer. Read them in
order - they follow the rhythm of every Pact interaction ever written:

| Step | Method               | Question it answers                         |
| ---- | -------------------- | ------------------------------------------- |
| 1    | `.given()`           | What must exist on the provider beforehand? |
| 2    | `.uponReceiving()`   | Which request are we talking about?         |
| 3    | `.withRequest()`     | What exactly will my client send?           |
| 4    | `.willRespondWith()` | What exactly do I need back?                |
| 5    | `.executeTest()`     | Run my REAL client against the mock         |

Tip for TODO 3: don't guess — open `src/comic-client.js` and look at what `getComic()`
actually sends. A contract that describes a request your client doesn't make is worth
nothing. (Pact will even tell you when this happens: unmatched requests get a 500.)

## 2. Run it

From the repo root:

```shell
npm run ex01:consumer:test
```

(Only `tests/` runs. The `solution/` folder holds the instructor's reference answer —
ignore it until you're done, then compare with `npm run ex01:consumer:solution`.)

Watch the failures while you fill things in. Two kinds of failure teach you the most:

- `Cannot read properties of undefined` → your TODO isn't filled yet
- `The following request was incorrect ... GET /api/comics/1` → your client sent
  something different from what `withRequest` promised

## 3. Open the contract

When the test is green, Pact wrote a file:

```plain
./pacts/ReadingApp-ComicCatalogue.json
```

Find these in it:

|     | Where in the JSON did...                      |
| --- | --------------------------------------------- |
| 1   | ...your `given(...)` string end up?           |
| 2   | ...the `Accept` header you promised go?       |
| 3   | ...the example value `42` for `readCount` go? |
| 4   | ...the name of YOUR application go?           |

Notice: this JSON is the entire deliverable. You could hand it to the team building the
provider and they would know everything you need — without a single meeting.

## 4. Think about it

- The mock answered with values YOU wrote. So what did this test actually prove?
  _(Answer: it proved your client correctly handles a response shaped like the one you
  need — and it produced the promise list the provider must keep.)_
- You promised exact values (`'Barrel - Part 1'`, `42`). Does the real provider store
  _your_ comic? What will happen in Exercise 2 when we verify against one?
