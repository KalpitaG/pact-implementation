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
            .uponReceiving('a request to search items')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                query: {
                    q: 'Test'
                }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Test Item'),
                    price: MatchersV3.integer(50),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, { q: 'Test' });
            expect(result).toBeDefined();
        });
    });
});