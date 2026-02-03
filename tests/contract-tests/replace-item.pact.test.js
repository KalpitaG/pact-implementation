import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { replaceItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'ItemsAPI',
});

describe('Consumer Pact Tests', () => {
    test('should replace an existing item', async () => {
        provider
            .given('an item with id 123 exists')
            .uponReceiving('a request to replace item with id 123')
            .withRequest({
                method: 'PUT',
                path: '/items/123',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: 'Updated Item',
                    price: 29.99
                }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Updated Item'),
                    price: MatchersV3.decimal(29.99)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const updatedItem = { name: 'Updated Item', price: 29.99 };
            const result = await replaceItem(mockProvider.url, '123', updatedItem);
            expect(result).toBeDefined();
            expect(result.name).toBe('Updated Item');
        });
    });
});