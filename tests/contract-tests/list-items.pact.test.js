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
    test('should list items', async () => {
        provider
            .given('no items exist')
            .uponReceiving('a request to list items')
            .withRequest({ method: 'GET', path: '/items' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { items: [], total: 0 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.items).toEqual([]);
            expect(result.total).toBe(0);
        });
    });

    test('should list items with category filter', async () => {
        provider
            .given('some items exist with categories')
            .uponReceiving('a request to list items with category filter')
            .withRequest({ method: 'GET', path: '/items?category=Electronics' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { items: [{ id: 1, name: 'Laptop', category: 'Electronics' }], total: 1 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url, { category: 'Electronics' });
            expect(result).toBeDefined();
            expect(result.items[0].category).toEqual('Electronics');
            expect(result.total).toBe(1);
        });
    });

    test('should list items with inStock filter', async () => {
        provider
            .given('some items exist with inStock status')
            .uponReceiving('a request to list items with inStock filter')
            .withRequest({ method: 'GET', path: '/items?inStock=true' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { items: [{ id: 1, name: 'Laptop', inStock: true }], total: 1 },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url, { inStock: true });
            expect(result).toBeDefined();
            expect(result.items[0].inStock).toEqual(true);
            expect(result.total).toBe(1);
        });
    });
});