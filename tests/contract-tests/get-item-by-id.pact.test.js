import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'WebConsumer',
    provider: 'MoviesAPI',
});

describe('Consumer Pact Tests', () => {
    test('should get item by id', async () => {
        provider
            .given('an item with ID 123 exists')
            .uponReceiving('a request for an item by ID')
            .withRequest({
                method: 'GET',
                path: '/items/123',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('example'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, "123");
            expect(result).toBeDefined();
            expect(result.id).toBeGreaterThan(0);
        });
    });
});