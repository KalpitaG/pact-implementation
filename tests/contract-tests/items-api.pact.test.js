import path from 'path';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { listItems, getItem, searchItems, createItem, replaceItem, updateItem, deleteItem } from '../../src/consumer.js';
import { describe, test, expect } from '@jest/globals';

const { like, eachLike, string, integer, boolean } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'petstore-consumer',
    provider: 'petstore-api'
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
            expect(result.total).toBeDefined();
        });
    });

    test('get items filtered by category and in stock status', async () => {
        provider
            .given('items exist in the inventory for a specific category and in stock')
            .uponReceiving('a request to get items filtered by category and in stock status')
            .withRequest({
                method: 'GET',
                path: '/items',
                query: { category: string('Electronics'), inStock: string('true') }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: eachLike({
                        id: integer(2),
                        name: string('Gadget'),
                        price: like(19.99),
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
                    price: like(9.99),
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

    test('get a non-existent item by ID', async () => {
        provider
            .given('item 999 does not exist')
            .uponReceiving('a request to get a non-existent item by ID')
            .withRequest({ method: 'GET', path: '/items/999' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { message: string('Item not found') }
            });

        await provider.executeTest(async (mockProvider) => {
            await expect(getItem(mockProvider.url, 999)).rejects.toThrow();
        });
    });

    test('search for items with a query term', async () => {
        provider
            .given('items matching \'widget\' exist')
            .uponReceiving('a request to search for items with a query term')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                query: { q: string('widget') }
            })
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
            expect(result.results.length).toBeGreaterThan(0);
            expect(result.query).toEqual('widget');
        });
    });

    test('search for items with no matching results', async () => {
        provider
            .given('no items matching \'nonexistent\' exist')
            .uponReceiving('a request to search for items with no matching results')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                query: { q: string('nonexistent') }
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    results: eachLike({}, { min: 0 }),
                    query: string('nonexistent'),
                    count: integer(0)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, 'nonexistent');
            expect(result).toBeDefined();
            expect(result.results).toEqual([]);
            expect(result.count).toEqual(0);
        });
    });

    test('create a new item', async () => {
        const newItem = { name: 'New Item', price: 25.50, category: 'Books', inStock: true };
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
            expect(result.name).toEqual(newItem.name);
        });
    });

    test('replace an existing item', async () => {
        const updatedItem = { name: 'Updated Widget', price: 12.99, category: 'Electronics', inStock: false };
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
                    price: like(12.99),
                    category: string('Electronics'),
                    inStock: boolean(false)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await replaceItem(mockProvider.url, 1, updatedItem);
            expect(result).toBeDefined();
            expect(result.name).toEqual(updatedItem.name);
        });
    });

    test('partially update an existing item', async () => {
        const patch = { price: 15.00 };
        provider
            .given('item 1 exists and can be updated')
            .uponReceiving('a request to partially update an existing item')
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
                    price: like(15.00),
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

    test('delete an existing item', async () => {
        provider
            .given('item 1 exists and can be deleted')
            .uponReceiving('a request to delete an existing item')
            .withRequest({ method: 'DELETE', path: '/items/1' })
            .willRespondWith({
                status: 204,
                headers: {},
                body: null
            });

        await provider.executeTest(async (mockProvider) => {
            const status = await deleteItem(mockProvider.url, 1);
            expect(status).toEqual(204);
        });
    });

    test('delete a non-existent item', async () => {
        provider
            .given('item 999 does not exist')
            .uponReceiving('a request to delete a non-existent item')
            .withRequest({ method: 'DELETE', path: '/items/999' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { message: string('Item not found') }
            });

        await provider.executeTest(async (mockProvider) => {
            await expect(deleteItem(mockProvider.url, 999)).rejects.toThrow();
        });
    });
});