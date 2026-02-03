import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'ItemProvider',
});

describe('getItem Pact Tests', () => {
    test('should return an item by id', async () => {
        provider
            .given('an item with id 123 exists')
            .uponReceiving('a request to get item with id 123')
            .withRequest({
                method: 'GET',
                path: '/items/123',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .willRespondWith({
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Test Item'),
                    price: MatchersV3.decimal(19.99)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const item = await getItem(mockProvider.url, '123');
            expect(item).toBeDefined();
            expect(item.id).toBe(123);
        });
    });
});