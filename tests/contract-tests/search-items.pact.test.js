import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { searchItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'WebConsumer',
    provider: 'ItemsAPI',
});

describe('searchItems Pact Tests', () => {
    test('should search items by query', async () => {
        provider
            .given('some items exist')
            .uponReceiving('a request to search items by query')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                query: { q: 'example' }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Example Item'),
                    price: MatchersV3.number(9.99),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, { q: 'example' });
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });

    test('should search items by minPrice and maxPrice', async () => {
        provider
            .given('some items exist')
            .uponReceiving('a request to search items by minPrice and maxPrice')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                query: { minPrice: '5', maxPrice: '15' }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Example Item'),
                    price: MatchersV3.number(9.99),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, { minPrice: 5, maxPrice: 15 });
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });
});