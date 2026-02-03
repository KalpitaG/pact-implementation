import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { searchItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'ItemProvider',
});

describe('searchItems Pact Tests', () => {
    test('should return items matching the search query', async () => {
        provider
            .given('items matching the search query exist')
            .uponReceiving('a request to search items')
            .withRequest({
                method: 'GET',
                path: '/items/search?q=example',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .willRespondWith({
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(789),
                    name: MatchersV3.string('Example Item'),
                    price: MatchersV3.decimal(29.99)
                })
            });

        await provider.executeTest(async (mockProvider) => {
            const searchParams = { q: 'example' };
            const items = await searchItems(mockProvider.url, searchParams);
            expect(items).toBeDefined();
            expect(items.length).toBeGreaterThan(0);
        });
    });
});