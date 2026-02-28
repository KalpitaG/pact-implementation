import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { searchItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('searchItems Pact Tests', () => {
    test('should search items by query', async () => {
        provider
            .given('some items exist')
            .uponReceiving('a request to search items with query Laptop')
            .withRequest({ method: 'GET', path: '/items/search?q=Laptop' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { results: [{ id: 1, name: 'Laptop' }], query: 'Laptop', count: 1 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, 'Laptop');
            expect(result).toBeDefined();
            expect(result.query).toBe('Laptop');
            expect(result.count).toBe(1);
        });
    });
});