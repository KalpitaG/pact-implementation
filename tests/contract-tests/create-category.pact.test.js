import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { createCategory } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('createCategory Pact Tests', () => {
    test('should create a new category', async () => {
        provider
            .given('no categories exist')
            .uponReceiving('a request to create a new category')
            .withRequest({ method: 'POST', path: '/categories', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Electronics' }) })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: { id: 1, name: 'Electronics' },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createCategory(mockProvider.url, { name: 'Electronics' });
            expect(result).toBeDefined();
            expect(result.name).toBe('Electronics');
        });
    });
});