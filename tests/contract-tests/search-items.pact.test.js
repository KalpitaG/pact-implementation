import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { searchItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'ItemsAPI',
});

describe('searchItems Pact Tests', () => {
    test('should search items by query', async () => {
        provider
            .given('some items match the query')
            .uponReceiving('a request to search items by query')
            .withRequest({ method: 'GET', path: '/items/search?q=example' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(5),
                    name: MatchersV3.string('Example Item'),
                    price: MatchersV3.decimal(15.0)
                })
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, { q: 'example' });
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });

    test('should return an empty array when no items match the query', async () => {
        provider
            .given('no items match the query')
            .uponReceiving('a request to search items with no matching items')
            .withRequest({ method: 'GET', path: '/items/search?q=nonexistent' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: []
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, { q: 'nonexistent' });
            expect(result).toEqual([]);
        });
    });
});