import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { searchItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'ItemProvider',
});

describe('Consumer Pact Tests for searchItems', () => {
    test('should return a list of items matching the search criteria', async () => {
        provider
            .given('some items match the search criteria')
            .uponReceiving('a request to search items with query parameters')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                headers: { 'Content-Type': 'application/json' },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(5),
                    name: MatchersV3.string('Searched Item'),
                    price: MatchersV3.decimal(29.99),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, { q: 'Searched', minPrice: 20, maxPrice: 30 });
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });
});