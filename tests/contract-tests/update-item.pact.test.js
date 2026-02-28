import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { updateItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('updateItem Pact Tests', () => {
    test('should update an existing item', async () => {
        provider
            .given('an item with id 1 exists')
            .uponReceiving('a request to update item with id 1')
            .withRequest({ method: 'PATCH', path: '/items/1', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price: 1600 }) })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { id: 1, name: 'Laptop', price: 1600 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await updateItem(mockProvider.url, '1', { price: 1600 });
            expect(result).toBeDefined();
            expect(result.price).toBe(1600);
        });
    });
});