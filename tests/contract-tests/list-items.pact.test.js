import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { listItems } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('listItems Pact Tests', () => {
    test('should list items with category filter', async () => {
        provider
            .given('items exist with category Electronics')
            .uponReceiving('a request to list items with category Electronics')
            .withRequest({
                method: 'GET',
                path: '/items',
                query: {
                    category: MatchersV3.string('Electronics')
                }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: MatchersV3.eachLike({
                        id: MatchersV3.integer(1),
                        name: MatchersV3.string('Item 1'),
                        category: MatchersV3.string('Electronics')
                    }),
                    total: MatchersV3.integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url, { category: 'Electronics' });
            expect(result).toBeDefined();
            expect(result.total).toBeGreaterThanOrEqual(0);
        });
    });

    test('should list items with inStock filter', async () => {
        provider
            .given('items exist with inStock true')
            .uponReceiving('a request to list items with inStock true')
            .withRequest({
                method: 'GET',
                path: '/items',
                query: {
                    inStock: MatchersV3.boolean(true)
                }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: MatchersV3.eachLike({
                        id: MatchersV3.integer(2),
                        name: MatchersV3.string('Item 2'),
                        inStock: MatchersV3.boolean(true)
                    }),
                    total: MatchersV3.integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url, { inStock: true });
            expect(result).toBeDefined();
            expect(result.total).toBeGreaterThanOrEqual(0);
        });
    });
});