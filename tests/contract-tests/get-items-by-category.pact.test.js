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
    test('should return items in a category', async () => {
        provider
            .given('items exist in the Electronics category')
            .uponReceiving('a request to get items in category 123')
            .withRequest({ method: 'GET', path: '/categories/123/items' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { category: 'Electronics', items: [{ id: MatchersV3.integer(1), name: MatchersV3.string('Laptop') }], count: 1 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemsByCategory(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.category).toBe('Electronics');
        });
    });
});