# Contract Testing Architecture (Pact)

## Overview
- **Pattern:** Consumer-Driven Contract Testing (CDCT)
- **Flow:** Consumer tests → Pact JSON generated → Publish to Broker → Provider verifies → Result published → `can-i-deploy` gate → (optional) record deployments
- **Participants in this project:**
    - **Consumer:** `ItemsConsumer` (JS)
    - **Provider:** `ItemsCrudAPI` (Express/JS)
    - **Broker:** PactFlow (hosted) + (optional) self-hosted (Podman)

## Supported languages (at a glance)
- Official/first-class: JavaScript/TypeScript, Java, .NET, Ruby, Go, Python, Swift/Kotlin (mobile)
- Community ports exist for others (e.g., Rust, PHP)
- Broker is a Ruby web app; CLI available for Node (`@pact-foundation/pact-cli`) and Ruby

## Pact file anatomy (from ./pacts/ItemsConsumer-ItemsCrudAPI.json)
- **consumer.name:** `ItemsConsumer`
- **provider.name:** `ItemsCrudAPI`
- **pactSpecification.version:** `3.0.0`
- **interactions:** 6 total (see below)
- **matching rules:** present for types/arrays/integers where used

### Interactions (summarised)
1. **POST /items** with body `{ price: 200 }` → **400** `{ error: "name required" }`  
   *State:* `no name is given when a new item is created`  
   *Matchers:* `$.error` is type `string`.

2. **POST /items** with body `{ name: "Laptop", price: 200 }` → **201** `{ id, name, price }`  
   *State:* `a name is provided for the item that needs to be added`  
   *Matchers:* `$.id` integer; `$.name` string; `$.price` integer.

3. **PUT /items/1** with body `{ name: "Mobile", price: 100 }` → **200** `{ id:1, name:"Mobile", price:100 }`  
   *State:* `an item with that id exists and can be replaced`  
   *Matchers:* `id` integer; `name` string; `price` integer.

4. **GET /items** → **200** `[{ id, name, price }]` (array, min 1)  
   *State:* `items exist`  
   *Matchers:* body root is an array with `min:1`.

5. **GET /items/1** → **200** `{ id:1, name:"Alpha", price:10 }`  
   *State:* `the item for that id exists`

6. **GET /items/9** → **404** `{ error:"not found" }`  
   *State:* `an item does not exist for the specified id`  
   *Matchers:* `$.error` is type `string`.

> **Notes:**  
> • Responses include the `Content-Type: application/json` header.  
> • Matchers keep contracts flexible (e.g., `integer`, `type`, `eachLike/min`).  
> • Provider states describe required data setup for each interaction.

## Why CDCT here
- Guarantees that `ItemsCrudAPI` won’t accidentally break `ItemsConsumer`.
- Verification is fast and focused vs. heavy E2E tests.
- Broker + `can-i-deploy` gives a reliable release gate.
