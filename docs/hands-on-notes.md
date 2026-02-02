# Hands-on Notes – Pact Implementation

**Project**: ItemsConsumer ↔ ItemsCrudAPI

---

## Step 1: Project Bootstrap

- Created repository: **pact-implementation**
- Initialized project:
  ```bash
  npm init -y
  ```
- Installed dependencies:
  ```bash
  npm install express axios
  ```
- Installed dev dependencies:
  ```bash
  npm install -D jest @pact-foundation/pact @pact-foundation/pact-cli
  ```
- Added `.gitignore` (Node template) and `README.md`

## Step 2: Source Setup

### `src/consumer.js`
- Axios client functions for `/items` (list, get, create, update, delete)

### `src/provider.js`
- Express CRUD service with in-memory data and helper `resetData()`

### `tests/consumer.pact.test.js`
6 consumer pact tests implemented:
- GET all items
- GET item by id
- GET non-existent id → returns 404
- POST create valid item
- POST create invalid item (missing name) → returns 400
- PUT replace existing item

### `tests/provider.verify.test.js`
- Pact Verifier test for provider

## Step 3: Run Consumer Tests

Run tests:
```bash
npm run test:consumer
```

**Result**:
- All 6 consumer tests passed
- Pact contract generated:
  ```bash
  ./pacts/ItemsConsumer-ItemsCrudAPI.json
  ```

## Step 4: Publish Contract to Broker

Set environment variables for PactFlow:
```bash
export PACT_BROKER_BASE_URL="https://student-3f37ab66.pactflow.io"
export PACT_BROKER_TOKEN="your-read-write-token-here"
export GIT_SHA=$(git rev-parse --short HEAD || echo "local-0001")
```

Publish pact:
```bash
npx pact-broker publish ./pacts \
  --consumer-app-version "$GIT_SHA" \
  --branch main \
  --broker-base-url "$PACT_BROKER_BASE_URL" \
  --broker-token "$PACT_BROKER_TOKEN"
```

**Result**:
- Pact successfully published to PactFlow
- Contract visible in PactFlow UI with status **Unverified**

## Step 5: Verify Provider

Run provider verification against pact:
```bash
npm run test:provider-verify
```

Verifier options included:
- `provider: "ItemsCrudAPI"`
- `pactBrokerUrl` + `pactBrokerToken`
- `consumerVersionSelectors: [{ branch: "main", latest: true }]`
- `publishVerificationResult: true`
- `providerVersion: "$GIT_SHA"`

**Result**:
- Verification successful
- PactFlow UI updated → contract marked **Verified**

## Step 6: Broker Features

### 6.1 Can I Deploy?

Check if consumer version can be deployed to test environment:
```bash
npx pact-broker can-i-deploy \
  --pacticipant ItemsConsumer \
  --version "$GIT_SHA" \
  --to-environment test \
  --broker-base-url "$PACT_BROKER_BASE_URL" \
  --broker-token "$PACT_BROKER_TOKEN"
```

**Result**: ✅ Output: You can deploy

### 6.2 Record Deployments

Record provider deployment:
```bash
npx pact-broker record-deployment \
  --pacticipant ItemsCrudAPI \
  --version "$GIT_SHA" \
  --environment test \
  --broker-base-url "$PACT_BROKER_BASE_URL" \
  --broker-token "$PACT_BROKER_TOKEN"
```

Record consumer deployment:
```bash
npx pact-broker record-deployment \
  --pacticipant ItemsConsumer \
  --version "$GIT_SHA" \
  --environment test \
  --broker-base-url "$PACT_BROKER_BASE_URL" \
  --broker-token "$PACT_BROKER_TOKEN"
```

**Result**:
- Both consumer and provider deployments recorded in test environment
- PactFlow UI updated with environment and deployment history

## Step 7: Summary

✅ Consumer tests → contract generated  
✅ Contract published to PactFlow  
✅ Provider verification passed  
✅ can-i-deploy confirms safe deployment  
✅ Deployments recorded in PactFlow

This completes the end-to-end Pact workflow:
**Consumer test → Contract → Broker → Provider verify → Can I Deploy → Deployment recorded**
