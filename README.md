# Pact consumer-side exercises

Hands-on exercises for the **consumer side of consumer-driven contract testing (CDCT)** with
[Pact](https://docs.pact.io), in JavaScript. Can be used as part of a larger training or
workshop. Made for my own use. Provided as is. Expect no maintenance except when I need it for
my purposes.

## What is a contract test?

Two services talk over an HTTP API: a **consumer** (the caller) and a **provider** (the API).
Integration tests between them are slow, brittle, and require both teams to have something
deployable at the same time. Contract testing replaces that with a _negotiated agreement_:

1. The **consumer** writes down what it expects from the provider — requests it will make and
   responses it needs back. This specification is the **contract** (a pact).
2. Pact turns that written expectation into a **mock provider** so the consumer code can be
   tested against it anywhere, without the real provider existing.
3. Later, **independently**, the real provider is checked ("verified") against the same
   contract. If the provider deviates, verification fails — before anything ships.

The "consumer-driven" part: the contract captures what the _consumer actually needs_, not what
the provider happens to expose. Nobody has to ask another team for their API docs and hope they
are accurate.

A pact is a plain JSON file. That's all there is to it — you'll open one in Exercise 1 and see
for yourself.

## Prerequisites

- Node.js **22+** (Pact JS v17 requires it; it downloads a native Rust library during install)
- npm

## Install

From this folder:

```shell
npm install
```

One-time install for the whole repo — exercises share the dependencies.

> Note: on some corporate machines with strict antivirus, the native Pact binary may be blocked.
> If `npm install` succeeds but tests fail with errors about the native library, that's usually
> why.

## The exercises

|     | Folder                             | Theme                                                 |
| --- | ---------------------------------- | ----------------------------------------------------- |
| —   | `./demo`                           | Instructor demo: the full loop, start to finish       |
| 1   | `./exercises/01-basics`            | Write your first pact; watch a contract appear        |
| 2   | `./exercises/02-provider-mismatch` | Green consumer tests, failing provider — who's right? |
| 3   | `./exercises/03-matchers`          | Exact values vs. flexible contracts (matchers)        |

Do them in order. Each folder has its own README with step-by-step instructions and explainers.

Scripts follow a `thing:side:action` pattern (run from this root folder):

```shell
npm run demo:consumer:test     # demo consumer tests
npm run demo:provider:start    # demo provider, own terminal (port 9500)
npm run demo:provider:test     # demo provider verification, other terminal

npm run ex01:consumer:test     # exercise 1 consumer tests (the TODO skeleton)
npm run ex01:consumer:solution # instructor reference solution for exercise 1

npm run ex02:consumer:test     # exercise 2 consumer tests
npm run ex02:provider:start    # terminal A: the real provider (port 9502)
npm run ex02:provider:test     # terminal B: verify the contract against it
npm run ex02:consumer:solution # instructor reference solution for exercise 2

npm run ex03:consumer:test     # exercise 3 consumer tests
npm run ex03:provider:start    # terminal A: the real provider (port 9503)
npm run ex03:provider:test     # terminal B: verify the contract against it
npm run ex03:consumer:solution # instructor reference solution for exercise 3
```

The provider always runs in its own terminal (`*:provider:start`) while verification
happens in another (`*:provider:test`) - separate processes, separate concerns, just like
the two teams whose work these contracts coordinate.

The `*:consumer:solution` scripts run the same consumer tests from each exercise's
`solution/` folder. Note that starter and solution pacts share one file per exercise —
delete the exercise's `pacts/` folder before switching between starter and solution, or
old interactions merge into the new pact and confuse verification.

## The comics API used here

All exercises use the same fictional **Comic Book Catalogue API** — a small service about comic
issues. It deliberately looks similar to, but is _not the same as_, the API in the Schemathesis
(provider-driven) half of this training: different endpoints, different field names, different
error shapes. When you switch between the two tracks, check which API you're talking to.

House style: every error response is RFC 7807 `application/problem+json` with at least
`{ status, title, detail }` — the same convention the Schemathesis exercises use.

Provider ports used by this repo: `9502` (exercise 2) and `9503` (exercise 3), so nothing
collides with Flask's usual `5000` range.
