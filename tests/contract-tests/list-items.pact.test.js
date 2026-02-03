import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { listItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemConsumer',
    provider: 'ItemProvider',
});

describe('listItems Pact Tests', () => {
    test('should return a list of items', async () => {
        provider
            .given('there are some items')
            .uponReceiving('a request to list items')
            .withRequest({
                method: 'GET',
                path: '/items',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .willRespondWith({
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Example Item'),
                    price: MatchersV3.decimal(9.99)
                })
            });

        await provider.executeTest(async (mockProvider) => {
            const items = await listItems(mockProvider.url);
            expect(items).toBeDefined();
            expect(items.length).toBeGreaterThan(0);
        });
    });
});