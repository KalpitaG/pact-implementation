import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { listCategories } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('listCategories Pact Tests', () => {
    test('should list categories', async () => {
        provider
            .given('no categories exist')
            .uponReceiving('a request to list categories')
            .withRequest({ method: 'GET', path: '/categories' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { categories: [], total: 0 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listCategories(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.categories).toEqual([]);
            expect(result.total).toBe(0);
        });
    });
});