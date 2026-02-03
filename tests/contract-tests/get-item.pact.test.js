import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should get an item by ID', async () => {
        provider
            .given('an item with ID 123 exists')
            .uponReceiving('a request to get item 123')
            .withRequest({
                method: 'GET',
                path: '/items/123',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Example Item'),
                    price: MatchersV3.integer(25),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.id).toBe(123);
        });
    });

    test('should return null if item does not exist', async () => {
        provider
            .given('no item with ID 456 exists')
            .uponReceiving('a request to get item 456')
            .withRequest({
                method: 'GET',
                path: '/items/456',
            })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: {},
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, '456');
            expect(result).toEqual({});
        });
    });
});