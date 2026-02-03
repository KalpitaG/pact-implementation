import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { updateItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'ItemProvider',
});

describe('Consumer Pact Tests for updateItem', () => {
    test('should update an existing item', async () => {
        provider
            .given('an item with ID 123 exists')
            .uponReceiving('a request to update an item')
            .withRequest({
                method: 'PATCH',
                path: '/items/123',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    price: 22.50,
                },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Existing Item'),
                    price: MatchersV3.decimal(22.50),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const patch = { price: 22.50 };
            const result = await updateItem(mockProvider.url, '123', patch);
            expect(result).toBeDefined();
            expect(result.price).toBe(22.50);
        });
    });
});