import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { replaceItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('replaceItem Pact Tests', () => {
    test('should replace an existing item', async () => {
        provider
            .given('an item with id 1 exists')
            .uponReceiving('a request to replace item with id 1')
            .withRequest({ method: 'PUT', path: '/items/1', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Laptop', price: 1500 }) })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { id: 1, name: 'Laptop', price: 1500 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await replaceItem(mockProvider.url, '1', { name: 'Laptop', price: 1500 });
            expect(result).toBeDefined();
            expect(result.price).toBe(1500);
        });
    });
});