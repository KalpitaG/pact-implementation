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
    test('should get an item by id', async () => {
        provider
            .given('an item with id 123 exists')
            .uponReceiving('a request to get item with id 123')
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

    test('should return null when item does not exist', async () => {
        provider
            .given('no item with id 999 exists')
            .uponReceiving('a request to get item with id 999')
            .withRequest({
                method: 'GET',
                path: '/items/999',
            })
            .willRespondWith({
                status: 404
            });

        await provider.executeTest(async (mockProvider) => {
            await expect(getItem(mockProvider.url, '999')).rejects.toThrow();
        });
    });
});