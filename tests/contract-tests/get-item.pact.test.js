import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'ItemProvider',
});

describe('Consumer Pact Tests for getItem', () => {
    test('should return an item when it exists', async () => {
        provider
            .given('an item with ID 123 exists')
            .uponReceiving('a request to get an item by ID')
            .withRequest({ method: 'GET', path: '/items/123' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Example Item'),
                    price: MatchersV3.decimal(9.99)
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.id).toBe(123);
        });
    });

    test('should return null when the item does not exist', async () => {
        provider
            .given('no item with ID 456 exists')
            .uponReceiving('a request to get an item by ID')
            .withRequest({ method: 'GET', path: '/items/456' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: {"error": "Item not found"},
            });

        await provider.executeTest(async (mockProvider) => {
            try {
                const result = await getItem(mockProvider.url, '456');
                expect(result).toBeUndefined();
            } catch (error) {
                expect(error.response.status).toBe(404);
            }
        });
    });
});