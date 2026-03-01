import path from 'path';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { listItems, getItem, searchItems, createItem, replaceItem, updateItem, deleteItem } from '../../src/consumer.js';
import { describe, test, expect } from '@jest/globals';

const { like, eachLike, string, integer, boolean } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'pact-provider-demo'
});

describe('Items API Contract', () => {
    test('get all items', async () => {
        provider
            .given('items exist in the inventory')
            .uponReceiving('a request to get all items')
            .withRequest({ method: 'GET', path: '/items' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: eachLike({
                        id: integer(1),
                        name: string('Widget'),
                        price: like(9.99),
                        category: string('Electronics'),
                        inStock: boolean(true)
                    }),
                    total: integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.items.length).toBeGreaterThan(0);
            expect(result.total).toBeGreaterThan(0);
        });
    });

    test('get items filtered by inStock status', async () => {
        provider
            .given('items exist in the inventory, some in stock')
            .uponReceiving('a request to get items filtered by inStock status')
            .withRequest({ method: 'GET', path: '/items', query: { inStock: string('true') } })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: eachLike({
                        id: integer(1),
                        name: string('Widget'),
                        price: like(9.99),
                        category: string('Electronics'),
                        inStock: boolean(true)
                    }),
                    total: integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url, { inStock: true });
            expect(result).toBeDefined();
            expect(result.items.length).toBeGreaterThan(0);
            expect(result.items[0].inStock).toBe(true);
        });
    });

    test('get items filtered by category', async () => {
        provider
            .given('items exist in the inventory, some in \'Electronics\' category')
            .uponReceiving('a request to get items filtered by category')
            .withRequest({ method: 'GET', path: '/items', query: { category: string('Electronics') } })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: eachLike({
                        id: integer(1),
                        name: string('Widget'),
                        price: like(9.99),
                        category: string('Electronics'),
                        inStock: boolean(true)
                    }),
                    total: integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url, { category: 'Electronics' });
            expect(result).toBeDefined();
            expect(result.items.length).toBeGreaterThan(0);
            expect(result.items[0].category).toBe('Electronics');
        });
    });

    test('get a specific item by ID', async () => {
        provider
            .given('item 1 exists')
            .uponReceiving('a request to get a specific item by ID')
            .withRequest({ method: 'GET', path: '/items/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    name: string('Widget'),
                    price: like(9.99),
                    category: string('Electronics'),
                    inStock: boolean(true)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });

    test('search for items by query term', async () => {
        provider
            .given('items exist that match \'widget\'')
            .uponReceiving('a request to search for items by query term')
            .withRequest({ method: 'GET', path: '/items/search', query: { q: string('widget') } })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    results: eachLike({
                        id: integer(1),
                        name: string('Widget'),
                        price: like(9.99)
                    }),
                    query: string('widget'),
                    count: integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, 'widget');
            expect(result).toBeDefined();
            expect(result.query).toBe('widget');
            expect(result.results.length).toBeGreaterThan(0);
        });
    });

    test('create a new item', async () => {
        const newItem = { name: 'New Item', price: 25.50, category: 'Books', inStock: true };
        provider
            .given('the items API is available')
            .uponReceiving('a request to create a new item')
            .withRequest({
                method: 'POST',
                path: '/items',
                headers: { 'Content-Type': 'application/json' },
                body: like(newItem)
            })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(100),
                    name: string('New Item'),
                    price: like(25.50),
                    category: string('Books'),
                    inStock: boolean(true)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createItem(mockProvider.url, newItem);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(newItem.name);
        });
    });

    test('replace an existing item', async () => {
        const updatedItem = { name: 'Replaced Item', price: 50.00, category: 'Home', inStock: false };
        provider
            .given('item 2 exists')
            .uponReceiving('a request to replace an existing item')
            .withRequest({
                method: 'PUT',
                path: '/items/2',
                headers: { 'Content-Type': 'application/json' },
                body: like(updatedItem)
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(2),
                    name: string('Replaced Item'),
                    price: like(50.00),
                    category: string('Home'),
                    inStock: boolean(false)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await replaceItem(mockProvider.url, 2, updatedItem);
            expect(result).toBeDefined();
            expect(result.id).toBe(2);
            expect(result.name).toBe(updatedItem.name);
        });
    });

    test('partially update an existing item', async () => {
        const patch = { price: 75.00 };
        provider
            .given('item 3 exists')
            .uponReceiving('a request to partially update an existing item')
            .withRequest({
                method: 'PATCH',
                path: '/items/3',
                headers: { 'Content-Type': 'application/json' },
                body: like(patch)
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(3),
                    name: string('Original Item'),
                    price: like(75.00),
                    category: string('Tools'),
                    inStock: boolean(true)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await updateItem(mockProvider.url, 3, patch);
            expect(result).toBeDefined();
            expect(result.id).toBe(3);
            expect(result.price).toBe(patch.price);
        });
    });

    test('delete an item', async () => {
        provider
            .given('item 4 exists')
            .uponReceiving('a request to delete an item')
            .withRequest({ method: 'DELETE', path: '/items/4' })
            .willRespondWith({
                status: 204
            });

        await provider.executeTest(async (mockProvider) => {
            const status = await deleteItem(mockProvider.url, 4);
            expect(status).toBe(204);
        });
    });
});