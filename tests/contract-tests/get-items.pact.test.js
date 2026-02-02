import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getItems } from "../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'WebConsumer',
    provider: 'MoviesAPI',
});

describe('Consumer Pact Tests', () => {
    test('should return an empty list of items when no items exist', async () => {
        provider
            .given('no items exist')
            .uponReceiving('a request for items')
            .withRequest({
                method: 'GET',
                path: '/items',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: [],
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItems(mockProvider.url);
            expect(result).toBeDefined();
            expect(result).toEqual([]);
        });
    });

    test('should return a list of items when some items exist', async () => {
        provider
            .given('some items exist')
            .uponReceiving('a request for items')
            .withRequest({
                method: 'GET',
                path: '/items',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: 123,
                    name: 'example',
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItems(mockProvider.url);
            expect(result).toBeDefined();
            expect(result[0].id).toEqual(123);
        });
    });
});