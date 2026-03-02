import path from 'path';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { listItems, getItem, getItemCount, searchItems, createItem, replaceItem, updateItem, deleteItem } from '../../src/consumer.js';
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
                        price: like(12.99),
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
            expect(result.total).toBeDefined();
        });
    });

    test('get items filtered by category and in stock', async () => {
        provider
            .given('items exist in the inventory for a specific category and stock status')
            .uponReceiving('a request to get items filtered by category and in stock')
            .withRequest({ method: 'GET', path: '/items', query: { category: string('Electronics'), inStock: string('true') } })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: eachLike({
                        id: integer(2),
                        name: string('Gadget'),
                        price: like(24.50),
                        category: string('Electronics'),
                        inStock: boolean(true)
                    }),
                    total: integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url, { category: 'Electronics', inStock: true });
            expect(result).toBeDefined();
            expect(result.items.length).toBeGreaterThan(0);
            expect(result.items[0].category).toEqual('Electronics');
            expect(result.items[0].inStock).toEqual(true);
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
                    price: like(12.99),
                    category: string('Electronics'),
                    inStock: boolean(true)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
        });
    });

    test('get the total item count', async () => {
        provider
            .given('items exist in the inventory')
            .uponReceiving('a request to get the total item count')
            .withRequest({ method: 'GET', path: '/items/count' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { count: integer(5) }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemCount(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.count).toBeDefined();
        });
    });

    test('search for items by query', async () => {
        provider
            .given('items matching \'test\' exist')
            .uponReceiving('a request to search for items by query')
            .withRequest({ method: 'GET', path: '/items/search', query: { q: string('test') } })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    results: eachLike({
                        id: integer(1),
                        name: string('Test Item'),
                        price: like(10.00)
                    }),
                    query: string('test'),
                    count: integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, 'test');
            expect(result).toBeDefined();
            expect(result.results.length).toBeGreaterThan(0);
            expect(result.query).toEqual('test');
        });
    });

    test('create a new item', async () => {
        const newItem = { name: 'New Item', price: 29.99, category: 'Books', inStock: true };

        provider
            .given('the items API is available for creation')
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
                    id: integer(10),
                    name: string('New Item'),
                    price: like(29.99),
                    category: string('Books'),
                    inStock: boolean(true)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createItem(mockProvider.url, newItem);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toEqual(newItem.name);
        });
    });

    test('replace an existing item', async () => {
        const updatedItem = { name: 'Updated Widget', price: 15.00, category: 'Electronics', inStock: false };

        provider
            .given('item 1 exists and can be replaced')
            .uponReceiving('a request to replace an existing item')
            .withRequest({
                method: 'PUT',
                path: '/items/1',
                headers: { 'Content-Type': 'application/json' },
                body: like(updatedItem)
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    name: string('Updated Widget'),
                    price: like(15.00),
                    category: string('Electronics'),
                    inStock: boolean(false)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await replaceItem(mockProvider.url, 1, updatedItem);
            expect(result).toBeDefined();
            expect(result.name).toEqual(updatedItem.name);
            expect(result.inStock).toEqual(updatedItem.inStock);
        });
    });

    test('partially update an item', async () => {
        const patch = { price: 13.50 };

        provider
            .given('item 1 exists and can be updated')
            .uponReceiving('a request to partially update an item')
            .withRequest({
                method: 'PATCH',
                path: '/items/1',
                headers: { 'Content-Type': 'application/json' },
                body: like(patch)
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    name: string('Widget'),
                    price: like(13.50),
                    category: string('Electronics'),
                    inStock: boolean(true)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await updateItem(mockProvider.url, 1, patch);
            expect(result).toBeDefined();
            expect(result.price).toEqual(patch.price);
        });
    });

    test('delete an item', async () => {
        provider
            .given('item 1 exists and can be deleted')
            .uponReceiving('a request to delete an item')
            .withRequest({ method: 'DELETE', path: '/items/1' })
            .willRespondWith({
                status: 204
            });

        await provider.executeTest(async (mockProvider) => {
            const status = await deleteItem(mockProvider.url, 1);
            expect(status).toEqual(204);
        });
    });
});
