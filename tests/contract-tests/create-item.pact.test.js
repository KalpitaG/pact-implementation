import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { createItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('createItem Pact Tests', () => {
    test('should create a new item', async () => {
        provider
            .given('no items exist')
            .uponReceiving('a request to create a new item')
            .withRequest({ method: 'POST', path: '/items', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Laptop', price: 1200 }) })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: { id: 1, name: 'Laptop', price: 1200 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createItem(mockProvider.url, { name: 'Laptop', price: 1200 });
            expect(result).toBeDefined();
            expect(result.name).toBe('Laptop');
        });
    });
});