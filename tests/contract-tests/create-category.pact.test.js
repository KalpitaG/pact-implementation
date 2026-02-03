import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { createCategory } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'CategoryProvider',
});

describe('Consumer Pact Tests', () => {
    test('should create a category', async () => {
        provider
            .given('no categories exist')
            .uponReceiving('a request to create a category')
            .withRequest({
                method: 'POST',
                path: '/categories',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: 'new category',
                    description: 'category description'
                }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.uuid(),
                    name: 'new category',
                    description: 'category description'
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createCategory(mockProvider.url, { name: 'new category', description: 'category description' });
            expect(result).toBeDefined();
            expect(result.name).toBe('new category');
        });
    });
});