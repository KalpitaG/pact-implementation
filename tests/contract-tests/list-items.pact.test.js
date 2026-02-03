import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { listItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should list items', async () => {
        provider
            .given('some items exist')
            .uponReceiving('a request to list items')
            .withRequest({ method: 'GET', path: '/items' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Example Item'),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });
});