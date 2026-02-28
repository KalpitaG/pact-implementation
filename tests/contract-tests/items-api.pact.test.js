import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { describe, test, expect } from "@jest/globals";
import { listItems, getItem, searchItems, createItem, replaceItem, updateItem, deleteItem } from "../../src/consumer.js";

const { eachLike, like, integer, string, boolean } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('Item API Pact Tests', () => {
    test('should list all items without filters', async () => {
        provider
            .given('items exist')
            .uponReceiving('a request to get all items without filters')
            .withRequest({
                method: 'GET',
                path: '/items',
                query: {},
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: eachLike({
                        id: integer(1),
                        name: string('Laptop'),
                        price: integer(1200),
                        category: string('Electronics'),
                        inStock: boolean(true),
                    }),
                    total: integer(1),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.items.length).toBeGreaterThan(0);
            expect(result.items[0].id).toBeDefined();
        });
    });

    test('should list items filtered by category and in stock', async () => {
        provider
            .given('items exist in \'Electronics\' category and are in stock')
            .uponReceiving('a request to get items filtered by category and in stock')
            .withRequest({
                method: 'GET',
                path: '/items',
                query: {
                    category: string('Electronics'),
                    inStock: boolean(true),
                },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    items: eachLike({
                        id: integer(1),
                        name: string('Laptop'),
                        price: integer(1200),
                        category: string('Electronics'),
                        inStock: boolean(true),
                    }),
                    total: integer(1),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listItems(mockProvider.url, { category: 'Electronics', inStock: true });
            expect(result).toBeDefined();
            expect(result.items.length).toBeGreaterThan(0);
            expect(result.items[0].category).toEqual('Electronics');
            expect(result.items[0].inStock).toEqual(true);
        });
    });

    test('should get a specific item by ID', async () => {
        provider
            .given('an item with ID 123 exists')
            .uponReceiving('a request to get a specific item by ID')
            .withRequest({
                method: 'GET',
                path: '/items/123',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(123),
                    name: string('Smartphone'),
                    price: integer(799),
                    category: string('Electronics'),
                    inStock: boolean(true),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.id).toEqual(123);
        });
    });

    test('should return null for a non-existent item ID', async () => {
        provider
            .given('no item with ID 999 exists')
            .uponReceiving('a request to get a non-existent item by ID')
            .withRequest({
                method: 'GET',
                path: '/items/999',
            })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { message: string('Item not found') },
            });

        await provider.executeTest(async (mockProvider) => {
            await expect(getItem(mockProvider.url, '999')).rejects.toThrow();
        });
    });

    test('should search for items by query', async () => {
        provider
            .given('items matching \'laptop\' exist')
            .uponReceiving('a request to search for items by query \'laptop\'')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                query: {
                    q: string('laptop'),
                },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    results: eachLike({
                        id: integer(1),
                        name: string('Laptop'),
                        price: integer(1200),
                        category: string('Electronics'),
                        inStock: boolean(true),
                    }),
                    query: string('laptop'),
                    count: integer(1),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, 'laptop');
            expect(result).toBeDefined();
            expect(result.query).toEqual('laptop');
            expect(result.results.length).toBeGreaterThan(0);
        });
    });

    test('should create a new item', async () => {
        provider
            .given('a new item can be created')
            .uponReceiving('a request to create a new item')
            .withRequest({
                method: 'POST',
                path: '/items',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: string('New Gadget'),
                    price: integer(50),
                    category: string('Accessories'),
                    inStock: boolean(true),
                },
            })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(100),
                    name: string('New Gadget'),
                    price: integer(50),
                    category: string('Accessories'),
                    inStock: boolean(true),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const newItem = { name: 'New Gadget', price: 50, category: 'Accessories', inStock: true };
            const result = await createItem(mockProvider.url, newItem);
            expect(result).toBeDefined();
            expect(result.name).toEqual(newItem.name);
            expect(result.id).toBeDefined();
        });
    });

    test('should replace an existing item', async () => {
        provider
            .given('an item with ID 123 exists and can be replaced')
            .uponReceiving('a request to replace an existing item')
            .withRequest({
                method: 'PUT',
                path: '/items/123',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: string('Updated Item'),
                    price: integer(150),
                    category: string('Books'),
                    inStock: boolean(false),
                },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(123),
                    name: string('Updated Item'),
                    price: integer(150),
                    category: string('Books'),
                    inStock: boolean(false),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const updatedItem = { name: 'Updated Item', price: 150, category: 'Books', inStock: false };
            const result = await replaceItem(mockProvider.url, '123', updatedItem);
            expect(result).toBeDefined();
            expect(result.id).toEqual(123);
            expect(result.name).toEqual(updatedItem.name);
        });
    });

    test('should partially update an existing item', async () => {
        provider
            .given('an item with ID 123 exists and can be updated')
            .uponReceiving('a request to partially update an existing item')
            .withRequest({
                method: 'PATCH',
                path: '/items/123',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    price: integer(160),
                    inStock: boolean(true),
                },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(123),
                    name: string('Updated Item'),
                    price: integer(160),
                    category: string('Books'),
                    inStock: boolean(true),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const patch = { price: 160, inStock: true };
            const result = await updateItem(mockProvider.url, '123', patch);
            expect(result).toBeDefined();
            expect(result.id).toEqual(123);
            expect(result.price).toEqual(patch.price);
        });
    });

    test('should delete an existing item', async () => {
        provider
            .given('an item with ID 123 exists and can be deleted')
            .uponReceiving('a request to delete an existing item')
            .withRequest({
                method: 'DELETE',
                path: '/items/123',
            })
            .willRespondWith({
                status: 204,
            });

        await provider.executeTest(async (mockProvider) => {
            const status = await deleteItem(mockProvider.url, '123');
            expect(status).toEqual(204);
        });
    });
});