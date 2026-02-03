import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getCategoryById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'CategoryProvider',
});

describe('Consumer Pact Tests', () => {
    test('should get a category by id', async () => {
        provider
            .given('a category with ID 123 exists')
            .uponReceiving('a request to get category with id 123')
            .withRequest({ method: 'GET', path: '/categories/123' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: '123',
                    name: 'example',
                    description: 'example description'
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getCategoryById(mockProvider.url, '123');
            expect(result).toEqual({
              id: '123',
              name: 'example',
              description: 'example description'
            });
        });
    });
});