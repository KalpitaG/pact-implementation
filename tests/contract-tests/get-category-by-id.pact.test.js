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
    test('should return a category', async () => {
        provider
            .given('a category with ID 123 exists')
            .uponReceiving('a request to get category 123')
            .withRequest({ method: 'GET', path: '/categories/123' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { id: MatchersV3.integer(123), name: MatchersV3.string('Electronics') },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getCategoryById(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.id).toBe(123);
        });
    });
});