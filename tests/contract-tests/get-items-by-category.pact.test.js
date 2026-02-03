import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItemsByCategory } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should get items by category', async () => {
        provider
            .given('a category with ID 1 exists and has items')
            .uponReceiving('a request to get items by category')
            .withRequest({
                method: 'GET',
                path: '/categories/1/items',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Item 1'),
                    price: MatchersV3.integer(10),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemsByCategory(mockProvider.url, 1);
            expect(result).toBeDefined();
        });
    });
});