import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should get an item by id', async () => {
        provider
            .given('an item with id 1 exists')
            .uponReceiving('a request to get item with id 1')
            .withRequest({ method: 'GET', path: '/items/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Example Item'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });
});