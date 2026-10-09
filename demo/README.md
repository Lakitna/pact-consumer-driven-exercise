# Demo - the full Pact loop

Instructor material. Shows the complete consumer-driven contract lifecycle in one sitting:
consumer test → mock → contract file → real provider → verification.

## Runbook

### 1. Show the client code

```plain
./src/comic-client.js
```

Talking point: this is just ordinary code calling an HTTP API. It has no idea Pact exists.
The only testable seam is the injected `baseUrl`.

### 2. Show the consumer test, then run it

```plain
./tests/comic-client.pact.test.js
```

Walk through the four arrange steps: `given` / `uponReceiving` / `withRequest` /
`willRespondWith`. Point out that the response body is a _promise_, not documentation.

```shell
npm run demo:consumer:test
```

Green — but nothing real was called! The test talked to a mock server Pact started on a
random port and shut down again.

### 3. Open the generated contract

```plain
./pacts/MyConsumerApplication-ComicCatalogue.json
```

Show that the pact is plain JSON: consumer name, provider name, interactions with request
expectations and response promises, and `matchingRules` for the matchers used. This file is
the artifact the two teams exchange (usually via a Pact Broker in real life).

Talking point: `metadata` shows which tools wrote it; `providerStates` is how `given(...)`
lands in the file.

### 4. Show the real provider

```plain
./provider/app.js
```

Highlight: under state "comic 1 exists" it returns **different data** than the pact's
examples (`Barrel - Part 2`, different date, different read count). By itself that's fine —
the contract only promises the shape.

### 5. Verify the provider against the contract

Two terminals - this is what CI would do on the provider side, independently:

```shell
npm run demo:provider:start     # terminal A: provider on http://127.0.0.1:9500
```

Keep terminal A open and watch requests stream by. Then:

```shell
npm run demo:provider:test      # terminal B
```

PASSED — even though the data differs from the examples. That's matchers doing their job
(`MatchersV3.integer(1)` means "any integer", not "exactly 1"). Point at the provider
terminal: the verifier also POSTed to `/_pactSetup` to arrange each `given(...)` state.

### 6. Break it on purpose (optional, if time)

In `./provider/app.js`, change the `/_pactSetup` handler for "comic 1 exists": rename
`title` to `name`, or return `readCount` as the string `"128"`. Restart the provider
(Ctrl-C, `npm run demo:provider:start`) and re-verify:

```shell
npm run demo:provider:test
```

Now verification fails with a precise mismatch report — and nobody had to run a single
end-to-end integration test between two live systems to find it.
