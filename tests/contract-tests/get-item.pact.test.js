import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'ItemsAPI',
});

describe('getItem Pact Tests', () => {
    test('should get an item by ID when it exists', async () => {
        provider
            .given('an item with ID 123 exists')
            .uponReceiving('a request to get an item by ID')
            .withRequest({ method: 'GET', path: '/items/123' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Test Item'),
                    price: MatchersV3.decimal(10.0)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.id).toBe(123);
        });
    });

    test('should return 404 when item ID does not exist', async () => {
        provider
            .given('no item with ID 456 exists')
            .uponReceiving('a request to get an item by ID that does not exist')
            .withRequest({ method: 'GET', path: '/items/456' })
            .willRespondWith({
                status: 404
            });

        await provider.executeTest(async (mockProvider) => {
            try {
                await getItem(mockProvider.url, '456');
            } catch (error) {
                expect(error.message).toContain('404');
            }
        });
    });
});