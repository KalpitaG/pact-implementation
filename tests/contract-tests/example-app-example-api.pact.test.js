import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { describe, test, expect } from "@jest/globals";
import { 
    listItems, 
    getItem, 
    searchItems, 
    createItem, 
    replaceItem, 
    updateItem, 
    deleteItem, 
    listCategories, 
    getCategoryById, 
    getItemsByCategory, 
    createCategory, 
    getUserById, 
    getUserProfile 
} from "../../src/consumer.js";

const { eachLike, like, integer, string, boolean } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('Example App Consumer Pact Tests', () => {
    test('should list all items', async () => {
        provider
            .given('items exist')
            .uponReceiving('a request to get all items')
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
                        name: string('Item 1'),
                        price: like(10.99),
                        category: string('Electronics'),
                        inStock: like(true),
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

    test('should list items by category and in-stock status', async () => {
        provider
            .given('items exist for category \'Electronics\' and are in stock')
            .uponReceiving('a request to get items by category and in-stock status')
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
                        price: like(1200.00),
                        category: string('Electronics'),
                        inStock: like(true),
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
        const itemId = '123';
        provider
            .given(`an item with ID ${itemId} exists`)
            .uponReceiving('a request to get a specific item by ID')
            .withRequest({
                method: 'GET',
                path: `/items/${itemId}`,
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(parseInt(itemId)),
                    name: string('Specific Item'),
                    price: like(25.50),
                    category: string('Books'),
                    inStock: like(true),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItem(mockProvider.url, itemId);
            expect(result).toBeDefined();
            expect(result.id).toEqual(parseInt(itemId));
        });
    });

    test('should search for items by query', async () => {
        const searchQuery = 'laptop';
        provider
            .given(`items matching '${searchQuery}' exist`)
            .uponReceiving('a request to search for items by query')
            .withRequest({
                method: 'GET',
                path: '/items/search',
                query: {
                    q: string(searchQuery),
                },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    results: eachLike({
                        id: integer(1),
                        name: string('Laptop Pro'),
                        price: like(1500.00),
                        category: string('Electronics'),
                        inStock: like(true),
                    }),
                    query: string(searchQuery),
                    count: integer(1),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await searchItems(mockProvider.url, searchQuery);
            expect(result).toBeDefined();
            expect(result.query).toEqual(searchQuery);
            expect(result.results.length).toBeGreaterThan(0);
        });
    });

    test('should create a new item', async () => {
        const newItem = { name: 'New Item', price: 99.99, category: 'Tools', inStock: true };
        provider
            .given('a new item can be created')
            .uponReceiving('a request to create a new item')
            .withRequest({
                method: 'POST',
                path: '/items',
                headers: { 'Content-Type': 'application/json' },
                body: newItem,
            })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(456),
                    name: string(newItem.name),
                    price: like(newItem.price),
                    category: string(newItem.category),
                    inStock: like(newItem.inStock),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createItem(mockProvider.url, newItem);
            expect(result).toBeDefined();
            expect(result.name).toEqual(newItem.name);
            expect(result.id).toBeDefined();
        });
    });

    test('should replace an existing item', async () => {
        const itemId = '123';
        const updatedItem = { name: 'Updated Item', price: 123.45, category: 'Home', inStock: false };
        provider
            .given(`an item with ID ${itemId} exists and can be replaced`)
            .uponReceiving('a request to replace an existing item')
            .withRequest({
                method: 'PUT',
                path: `/items/${itemId}`,
                headers: { 'Content-Type': 'application/json' },
                body: updatedItem,
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(parseInt(itemId)),
                    name: string(updatedItem.name),
                    price: like(updatedItem.price),
                    category: string(updatedItem.category),
                    inStock: like(updatedItem.inStock),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await replaceItem(mockProvider.url, itemId, updatedItem);
            expect(result).toBeDefined();
            expect(result.name).toEqual(updatedItem.name);
            expect(result.id).toEqual(parseInt(itemId));
        });
    });

    test('should partially update an item', async () => {
        const itemId = '123';
        const patch = { price: 50.00, inStock: false };
        provider
            .given(`an item with ID ${itemId} exists and can be updated`)
            .uponReceiving('a request to partially update an item')
            .withRequest({
                method: 'PATCH',
                path: `/items/${itemId}`,
                headers: { 'Content-Type': 'application/json' },
                body: patch,
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(parseInt(itemId)),
                    name: string('Specific Item'), // Assuming other fields remain
                    price: like(patch.price),
                    category: string('Books'),
                    inStock: like(patch.inStock),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await updateItem(mockProvider.url, itemId, patch);
            expect(result).toBeDefined();
            expect(result.price).toEqual(patch.price);
            expect(result.inStock).toEqual(patch.inStock);
        });
    });

    test('should delete an item', async () => {
        const itemId = '123';
        provider
            .given(`an item with ID ${itemId} exists and can be deleted`)
            .uponReceiving('a request to delete an item')
            .withRequest({
                method: 'DELETE',
                path: `/items/${itemId}`,
            })
            .willRespondWith({
                status: 204,
            });

        await provider.executeTest(async (mockProvider) => {
            const status = await deleteItem(mockProvider.url, itemId);
            expect(status).toEqual(204);
        });
    });

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
        const categoryId = '1';
        provider
            .given(`a category with ID ${categoryId} exists`)
            .uponReceiving('a request to get a specific category by ID')
            .withRequest({
                method: 'GET',
                path: `/categories/${categoryId}`,
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(parseInt(categoryId)),
                    name: string('Electronics'),
                    slug: string('electronics'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getCategoryById(mockProvider.url, categoryId);
            expect(result).toBeDefined();
            expect(result.id).toEqual(parseInt(categoryId));
        });
    });

    test('should get items for a specific category', async () => {
        const categoryId = '1';
        provider
            .given(`a category with ID ${categoryId} exists and has items`)
            .uponReceiving('a request to get items for a specific category')
            .withRequest({
                method: 'GET',
                path: `/categories/${categoryId}/items`,
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    category: string('Electronics'),
                    items: eachLike({
                        id: integer(101),
                        name: string('Smartphone'),
                        price: like(799.99),
                        category: string('Electronics'),
                        inStock: like(true),
                    }),
                    count: integer(1),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getItemsByCategory(mockProvider.url, categoryId);
            expect(result).toBeDefined();
            expect(result.category).toEqual('Electronics');
            expect(result.items.length).toBeGreaterThan(0);
        });
    });

    test('should create a new category', async () => {
        const newCategory = { name: 'New Category', slug: 'new-category' };
        provider
            .given('a new category can be created')
            .uponReceiving('a request to create a new category')
            .withRequest({
                method: 'POST',
                path: '/categories',
                headers: { 'Content-Type': 'application/json' },
                body: newCategory,
            })
            .willRespondWith({
                status: 201,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(2),
                    name: string(newCategory.name),
                    slug: string(newCategory.slug),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await createCategory(mockProvider.url, newCategory);
            expect(result).toBeDefined();
            expect(result.name).toEqual(newCategory.name);
            expect(result.id).toBeDefined();
        });
    });

    test('should get public user info by ID', async () => {
        const userId = '1';
        provider
            .given(`a user with ID ${userId} exists`)
            .uponReceiving('a request to get public user info by ID')
            .withRequest({
                method: 'GET',
                path: `/users/${userId}`,
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(parseInt(userId)),
                    username: string('testuser'),
                    role: string('user'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, userId);
            expect(result).toBeDefined();
            expect(result.id).toEqual(parseInt(userId));
            expect(result.username).toBeDefined();
            expect(result.role).toBeDefined();
            expect(result.email).toBeUndefined(); // Public info should not include email
        });
    });

    test('should return null for non-existent user public info', async () => {
        const userId = '999';
        provider
            .given(`no user with ID ${userId} exists`)
            .uponReceiving('a request to get public user info by ID that does not exist')
            .withRequest({
                method: 'GET',
                path: `/users/${userId}`,
            })
            .willRespondWith({
                status: 404,
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, userId);
            expect(result).toBeNull();
        });
    });

    test('should get full user profile by ID', async () => {
        const userId = '1';
        provider
            .given(`a user with ID ${userId} exists and profile is available`)
            .uponReceiving('a request to get full user profile by ID')
            .withRequest({
                method: 'GET',
                path: `/users/${userId}/profile`,
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(parseInt(userId)),
                    username: string('testuser'),
                    email: string('test@example.com'),
                    role: string('user'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, userId);
            expect(result).toBeDefined();
            expect(result.id).toEqual(parseInt(userId));
            expect(result.email).toBeDefined(); // Full profile should include email
        });
    });

    test('should return null for non-existent user profile', async () => {
        const userId = '999';
        provider
            .given(`no user with ID ${userId} exists`)
            .uponReceiving('a request to get full user profile by ID that does not exist')
            .withRequest({
                method: 'GET',
                path: `/users/${userId}/profile`,
            })
            .willRespondWith({
                status: 404,
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, userId);
            expect(result).toBeNull();
        });
    });
});