# Contract-Testing Tool Comparison (filled for Pact)

## 1) Setup / Install
- **Consumer lib (JS):** `@pact-foundation/pact`
- **CLI:** `@pact-foundation/pact-cli`
- **Provider:** real service (Express app) started in tests
- **Broker options:** PactFlow (SaaS) or self-hosted container (sqlite or Postgres)

## 2) Writing Contracts (DX)
- Write **consumer tests** in Jest using Pact:
    - `provider.given().uponReceiving().withRequest().willRespondWith().executeTest()`
    - Use `MatchersV3`: `like`, `integer`, `eachLike` to avoid brittle values
- Pact JSON generated to `./pacts/*.json` automatically after tests

## 3) Mocking & Provider States
- Consumer uses Pact mock server; **no real provider needed** for consumer tests
- Provider verification runs against **real provider** with **state handlers** mapping the `.given("...")` strings to data setup (e.g., `resetData()`)

## 4) Spec Format & Tooling
- Pact Specification v3 JSON:
    - `consumer`, `provider`, `interactions[]`, `request`, `response`, `matchingRules`
- Tooling:
    - Pact mock server (test-time)
    - Verifier (provider checks)
    - Broker (contracts storage, matrix, environments, webhooks)

## 5) CI/CD (Publish, Verify, Gate)
- Consumer job: run pact tests → **publish pact** with **version = git SHA** and **branch = main**
- Provider job: start service → **verify from Broker** → **publish result** (`providerVersion = git SHA`)
- Gate: `pact-broker can-i-deploy --to-environment <env>`
- (Optional) `record-deployment` for consumer/provider to reflect live envs

## 6) Maintenance
- Keep provider state handlers minimal (e.g., one `resetData()` + targeted inserts)
- Always use matchers for variable fields (ids, timestamps)
- Align names exactly: `ItemsConsumer`, `ItemsCrudAPI`
- Align selectors (branch/tag) across publish & verify

## 7) Ecosystem / Support
- Mature libs for major languages
- PactFlow adds branches/environments UI, webhooks, SSO, audit, SLAs
- Community is active (pact-foundation GitHub + docs)

## 8) Pros / Cons
**Pros**
- Early break detection; fast tests; precise scope
- Independent deployments with `can-i-deploy`
- “Living” API documentation based on what consumers actually use

**Cons / Gotchas**
- Provider states/data setup effort
- Over-specified contracts can be brittle (fix with matchers)
- Correct versioning/tagging/branching is essential
