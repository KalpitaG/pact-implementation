import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { listCategories } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should list all categories when no categories exist', async () => {
        provider
            .given('no categories exist')
            .uponReceiving('a request to list categories')
            .withRequest({ method: 'GET', path: '/categories' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: []
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listCategories(mockProvider.url);
            expect(result).toBeDefined();
            expect(result).toEqual([]);
        });
    });

    test('should list categories when they exist', async () => {
        provider
            .given('some categories exist')
            .uponReceiving('a request to list categories')
            .withRequest({ method: 'GET', path: '/categories' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Category 1'),
                    description: MatchersV3.string('Description 1')
                })
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listCategories(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });
});