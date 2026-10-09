# Exercise 2 - Green tests, broken promise

The claim we are testing today:

> Passing consumer tests do not mean your provider agrees with you. Verification does.

In Exercise 1 you wrote a pact and felt smug about the green checkmark. This exercise
collects that debt. The **Comic Catalogue team deployed a real provider last week**. It
exists at `./provider/app.js`, it works, and it disagrees with your contract in three
places.

## Rules of engagement

- `provider/` is **READ-ONLY**. You cannot deploy another team's service, and editing it
  here would cheat the exercise.
- Your tools are: `tests/comic-client.pact.test.js` (the pact) and `src/comic-client.js`
  (your own code).

## 1. Run the consumer tests — feel good

From the repo root:

```shell
npm run ex02:consumer:test
```

Green. All three interactions pass... against the mock, which gives exactly what you
asked for. Nothing here proves anything about the real world.

## 2. Verify against reality — feel the floor drop

Two terminals:

```shell
npm run ex02:provider:start     # terminal A: the real provider on port 9502
npm run ex02:provider:test      # terminal B: replay the pact against it
```

Keep terminal A open - you can watch every request the verifier replays stream by, and
`curl http://127.0.0.1:9502/api/comics?limit=2` yourself to see what reality returns.

Three failures. Read each one like a report from a border inspection:

|     | Interaction | What the pact promised | What the provider did |
| --- | ----------- | ---------------------- | --------------------- |
| 1   |             |                        |                       |
| 2   |             |                        |                       |
| 3   |             |                        |                       |

(Deviation #3 is a house-style upgrade: the provider now answers every error with
[RFC 7807 problem+json](https://www.rfc-editor.org/rfc/rfc7807) — `{ status, title,
detail }` and Content-Type `application/problem+json`. Your old contract still promises
a plain `{ error }` body. Adopt the standard shape.)

## 3. Update the contract

For each failure, edit `tests/comic-client.pact.test.js` so the promise matches the
provider's actual behavior. Re-run `test:02` then `verify:02`.

You'll notice something uncomfortable: some assertions in the _consumer tests themselves_
now fail too (`expect(comics).toHaveLength(2)` gets an object, not an array). That's
correct! Your client code was written against the fantasy. Update `src/comic-client.js`
to match the new contract — contract and consumer code move together or nothing works.

When both commands are green again, well done: you have a truthful agreement.

## 4. Now argue about it

The provider changed its API without asking you. You just rewrote your contract to match.
Was this still _consumer-driven_ contract testing? Points for both sides:

- "The contract must describe reality, or it's fiction." True — verification exists to
  keep contracts honest.
- "But the consumer drives!" Also true — in a real org you'd ask: do we _need_ 201 and a
  bare array, or do we just need _something consistent_? If the old shape worked fine for
  our app, changing the contract to chase the provider is surrender, not engineering.

The professional answer: **a breaking provider change should be negotiated, not absorbed.**
Pact gave you the failure _before_ production — that's the win. What you do next (accept
it, push back, version the endpoint) is a conversation between teams. The contract is just
where you write down the outcome.

## Reference solution

`./solution/` contains the updated pact and matching client. Run it with:

```shell
npm run ex02:consumer:solution   # consumer tests against the updated contract
npm run ex02:provider:test       # verification of that pact - green (provider still running)
```

Peek only when you're done.
