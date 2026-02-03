import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { searchItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should search items by query', async () => {
        provider
            .given('some items exist')
            .uponReceiving('a request to search items by query')
            .withRequest({ method: 'GET', path: '/items/search?q=test' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Test Item'),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, { q: 'test' });
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });

    test('should search items by price range', async () => {
        provider
            .given('some items exist')
            .uponReceiving('a request to search items by price range')
            .withRequest({ method: 'GET', path: '/items/search?minPrice=10&maxPrice=20' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Test Item'),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, { minPrice: 10, maxPrice: 20 });
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });
});