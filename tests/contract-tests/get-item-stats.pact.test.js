import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItemStats } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should get item statistics', async () => {
        provider
            .given('item statistics are available')
            .uponReceiving('a request to get item statistics')
            .withRequest({ method: 'GET', path: '/items/stats' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    averagePrice: MatchersV3.integer(25),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemStats(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.averagePrice).toBeGreaterThan(0);
        });
    });
});