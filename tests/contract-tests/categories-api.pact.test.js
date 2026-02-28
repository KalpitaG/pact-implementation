import path from 'path';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { listCategories, getCategoryById, getItemsByCategory, createCategory } from '../../src/consumer.js';
import { describe, test, expect } from '@jest/globals';

const { like, eachLike, string, integer } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'petstore-consumer',
    provider: 'petstore-api'
});

describe('Categories API Contract', () => {
    test('get all categories', async () => {
        provider
            .given('categories exist in the system')
            .uponReceiving('a request to get all categories')
            .withRequest({ method: 'GET', path: '/categories' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    categories: eachLike({
                        id: integer(1),
                        name: string('Electronics'),
                        slug: string('electronics')
                    }),
                    total: integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listCategories(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.categories.length).toBeGreaterThan(0);
        });
    });

    test('get a specific category by ID', async () => {
        provider
            .given('category 1 exists')
            .uponReceiving('a request to get a specific category by ID')
            .withRequest({ method: 'GET', path: '/categories/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    name: string('Electronics'),
                    slug: string('electronics')
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getCategoryById(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
        });
    });

    test('get a non-existent category by ID', async () => {
        provider
            .given('category 999 does not exist')
            .uponReceiving('a request to get a non-existent category by ID')
            .withRequest({ method: 'GET', path: '/categories/999' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { message: string('Category not found') }
            });

        await provider.executeTest(async (mockProvider) => {
            await expect(getCategoryById(mockProvider.url, 999)).rejects.toThrow();
        });
    });

    test('get items by category ID', async () => {
        provider
            .given('category 1 exists with items')
            .uponReceiving('a request to get items by category ID')
            .withRequest({ method: 'GET', path: '/categories/1/items' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    category: string('Electronics'),
                    items: eachLike({
                        id: integer(1),
                        name: string('Widget')
                    }),
                    count: integer(1)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemsByCategory(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.category).toEqual('Electronics');
            expect(result.items.length).toBeGreaterThan(0);
        });
    });

    test('get items for an empty category', async () => {
        provider
            .given('category 2 exists with no items')
            .uponReceiving('a request to get items for an empty category')
            .withRequest({ method: 'GET', path: '/categories/2/items' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    category: string('Books'),
                    items: eachLike({}, { min: 0 }),
                    count: integer(0)
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemsByCategory(mockProvider.url, 2);
            expect(result).toBeDefined();
            expect(result.category).toEqual('Books');
            expect(result.items).toEqual([]);
            expect(result.count).toEqual(0);
        });
    });

    test('create a new category', async () => {
        const newCategory = { name: 'New Category', slug: 'new-category' };
        provider
            .given('the categories API is available for creation')
            .uponReceiving('a request to create a new category')
            .withRequest({
                method: 'POST',
                path: '/categories',
                headers: { 'Content-Type': 'application/json' },
                body: like(newCategory)
            })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(100),
                    name: string('New Category'),
                    slug: string('new-category')
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createCategory(mockProvider.url, newCategory);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toEqual(newCategory.name);
        });
    });
});