import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { replaceItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'ItemsAPI',
});

describe('replaceItem Pact Tests', () => {
    test('should replace an item', async () => {
        provider
            .given('an item with ID 123 exists')
            .uponReceiving('a request to replace an item')
            .withRequest({
                method: 'PUT',
                path: '/items/123',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: 'Updated Item',
                    price: 30.0
                }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Updated Item'),
                    price: MatchersV3.decimal(30.0)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const updatedItem = { name: 'Updated Item', price: 30.0 };
            const result = await replaceItem(mockProvider.url, '123', updatedItem);
            expect(result).toBeDefined();
            expect(result.name).toBe('Updated Item');
        });
    });
});