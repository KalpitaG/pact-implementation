import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getCategoryById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('getCategoryById Pact Tests', () => {
    test('should get a category by id', async () => {
        provider
            .given('a category with id 1 exists')
            .uponReceiving('a request to get category with id 1')
            .withRequest({ method: 'GET', path: '/categories/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { id: 1, name: 'Electronics' },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getCategoryById(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });
});