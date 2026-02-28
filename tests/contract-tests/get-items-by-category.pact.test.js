import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItemsByCategory } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('getItemsByCategory Pact Tests', () => {
    test('should get items by category', async () => {
        provider
            .given('a category with id 1 exists and has items')
            .uponReceiving('a request to get items by category with id 1')
            .withRequest({ method: 'GET', path: '/categories/1/items' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { category: 'Electronics', items: [{ id: 1, name: 'Laptop' }], count: 1 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemsByCategory(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.category).toBe('Electronics');
            expect(result.count).toBe(1);
        });
    });
});