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
            .given('items exist matching query term')
            .uponReceiving('a request to search items with query term')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                query: {
                    q: MatchersV3.string('term')
                }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    results: MatchersV3.eachLike({
                        id: MatchersV3.integer(1),
                        name: MatchersV3.string('Searched Item'),
                    }),
                    query: MatchersV3.string('term'),
                    count: MatchersV3.integer(1)
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, 'term');
            expect(result).toBeDefined();
            expect(result.query).toBe('term');
        });
    });
});