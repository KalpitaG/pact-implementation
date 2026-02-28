import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { describe, test, expect } from "@jest/globals";
import { listCategories, getCategoryById, getItemsByCategory, createCategory } from "../../src/consumer.js";

const { eachLike, like, integer, string } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('Category API Pact Tests', () => {
    test('should list all categories', async () => {
        provider
            .given('categories exist')
            .uponReceiving('a request to get all categories')
            .withRequest({
                method: 'GET',
                path: '/categories',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    categories: eachLike({
                        id: integer(1),
                        name: string('Electronics'),
                        slug: string('electronics'),
                    }),
                    total: integer(1),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await listCategories(mockProvider.url);
            expect(result).toBeDefined();
            expect(result.categories.length).toBeGreaterThan(0);
        });
    });

    test('should get a specific category by ID', async () => {
        provider
            .given('a category with ID 1 exists')
            .uponReceiving('a request to get a specific category by ID')
            .withRequest({
                method: 'GET',
                path: '/categories/1',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    name: string('Electronics'),
                    slug: string('electronics'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getCategoryById(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
        });
    });

    test('should get items by category ID', async () => {
        provider
            .given('a category with ID 1 exists and has items')
            .uponReceiving('a request to get items by category ID')
            .withRequest({
                method: 'GET',
                path: '/categories/1/items',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    category: string('Electronics'),
                    items: eachLike({
                        id: integer(1),
                        name: string('Laptop'),
                        price: integer(1200),
                        inStock: MatchersV3.boolean(true),
                    }),
                    count: integer(1),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemsByCategory(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.category).toEqual('Electronics');
            expect(result.items.length).toBeGreaterThan(0);
        });
    });

    test('should create a new category', async () => {
        provider
            .given('a new category can be created')
            .uponReceiving('a request to create a new category')
            .withRequest({
                method: 'POST',
                path: '/categories',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: string('Books'),
                    slug: string('books'),
                },
            })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(2),
                    name: string('Books'),
                    slug: string('books'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const newCategory = { name: 'Books', slug: 'books' };
            const result = await createCategory(mockProvider.url, newCategory);
            expect(result).toBeDefined();
            expect(result.name).toEqual(newCategory.name);
        });
    });
});