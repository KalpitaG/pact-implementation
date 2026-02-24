import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { createCategory } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should create a category', async () => {
        provider
            .given('can create a category')
            .uponReceiving('a request to create a category')
            .withRequest({
                method: 'POST',
                path: '/categories',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: 'New Category',
                    description: 'New Description'
                }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(3),
                    name: MatchersV3.string('New Category'),
                    description: MatchersV3.string('New Description')
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createCategory(mockProvider.url, { name: 'New Category', description: 'New Description' });
            expect(result).toBeDefined();
            expect(result.name).toBe('New Category');
        });
    });

    test('should not create a category with empty name', async () => {
        provider
            .given('cannot create a category with empty name')
            .uponReceiving('a request to create a category with empty name')
            .withRequest({
                method: 'POST',
                path: '/categories',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: '',
                    description: 'New Description'
                }
            })
            .willRespondWith({
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    error: 'Name cannot be empty'
                }
            });

        await provider.executeTest(async (mockProvider) => {
            await expect(createCategory(mockProvider.url, { name: '', description: 'New Description' })).rejects.toThrow();
        });
    });
});