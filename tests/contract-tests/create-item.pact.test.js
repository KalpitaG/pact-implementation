import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { createItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should create a new item', async () => {
        provider
            .given('no items exist')
            .uponReceiving('a request to create a new item')
            .withRequest({
                method: 'POST',
                path: '/items',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: 'New Item',
                    price: 19.99
                }
            })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('New Item'),
                    price: MatchersV3.decimal(19.99)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const newItem = { name: 'New Item', price: 19.99 };
            const result = await createItem(mockProvider.url, newItem);
            expect(result).toBeDefined();
            expect(result.name).toBe('New Item');
        });
    });
});