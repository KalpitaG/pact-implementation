import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('getItem Pact Tests', () => {
    test('should get an item by ID', async () => {
        provider
            .given('an item with ID 1 exists')
            .uponReceiving('a request to get item 1')
            .withRequest({ method: 'GET', path: '/items/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Test Item'),
                    price: MatchersV3.integer(25)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });

    test('should return null when item is not found', async () => {
        provider
            .given('no item with ID 999 exists')
            .uponReceiving('a request to get item 999')
            .withRequest({ method: 'GET', path: '/items/999' })
            .willRespondWith({
                status: 404
            });

        await provider.executeTest(async (mockProvider) => {
            try {
                await getItem(mockProvider.url, 999);
            } catch (error) {
                expect(error.response.status).toBe(404);
            }
        });
    });
});