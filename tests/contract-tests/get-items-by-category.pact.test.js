import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItemsByCategory } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'CategoryProvider',
});

describe('Consumer Pact Tests', () => {
    test('should get items by category', async () => {
        provider
            .given('category with ID 123 exists and has items')
            .uponReceiving('a request to get items for category 123')
            .withRequest({ method: 'GET', path: '/categories/123/items' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.uuid(),
                    name: MatchersV3.string(),
                    price: MatchersV3.integer(100)
                })
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemsByCategory(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });
});