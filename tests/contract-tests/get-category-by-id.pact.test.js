import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getCategoryById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should get a category by ID', async () => {
        provider
            .given('a category with ID 1 exists')
            .uponReceiving('a request to get a category by ID')
            .withRequest({
                method: 'GET',
                path: '/categories/1',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Category 1'),
                    description: MatchersV3.string('Description 1'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getCategoryById(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });

    test('should return null when category does not exist', async () => {
        provider
            .given('no category with ID 999 exists')
            .uponReceiving('a request to get a category by ID that does not exist')
            .withRequest({
                method: 'GET',
                path: '/categories/999',
            })
            .willRespondWith({
                status: 404,
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getCategoryById(mockProvider.url, 999);
            expect(result).toBe(null);
        });
    });
});