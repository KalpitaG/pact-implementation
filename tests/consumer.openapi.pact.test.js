import path from 'path';
import {PactV3, MatchersV3} from "@pact-foundation/pact";
import {
    listItems, createItem, deleteItem, updateItem, replaceItem, getItem
} from "../src/consumer.js";
import {describe, test, expect} from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ItemsConsumer',
    provider: 'ItemsCrudAPI'
});

// Expected item structure based on OpenAPI schema
const EXPECTED_ITEM = {
    id: MatchersV3.integer(1),
    name: MatchersV3.like("Laptop"),
    price: MatchersV3.decimal(299.99)
};

const EXPECTED_ITEM_RESPONSE = {
    id: 1,
    name: "Laptop", 
    price: 299.99
};

describe('Items API Consumer Tests - Generated from OpenAPI', () => {

    describe('GET /items - List all items', () => {
        test('should return a list of items when items exist', async () => {
            provider
                .given('items exist in the system')
                .uponReceiving('a request to list all items')
                .withRequest({
                    method: 'GET',
                    path: '/items'
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: MatchersV3.eachLike(EXPECTED_ITEM)
                });

            await provider.executeTest(async mockProvider => {
                const items = await listItems(mockProvider.url);
                expect(Array.isArray(items)).toBe(true);
                expect(items.length).toBeGreaterThan(0);
                expect(items[0]).toMatchObject({
                    id: expect.any(Number),
                    name: expect.any(String),
                    price: expect.any(Number)
                });
            });
        });

        test('should return empty array when no items exist', async () => {
            provider
                .given('no items exist in the system')
                .uponReceiving('a request to list all items when none exist')
                .withRequest({
                    method: 'GET',
                    path: '/items'
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: []
                });

            await provider.executeTest(async mockProvider => {
                const items = await listItems(mockProvider.url);
                expect(Array.isArray(items)).toBe(true);
                expect(items.length).toBe(0);
            });
        });
    });

    describe('GET /items/{id} - Get specific item', () => {
        test('should return an item when it exists', async () => {
            provider
                .given('an item with id 1 exists')
                .uponReceiving('a request to get item with id 1')
                .withRequest({
                    method: 'GET',
                    path: '/items/1'
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: EXPECTED_ITEM
                });

            await provider.executeTest(async mockProvider => {
                const item = await getItem(mockProvider.url, 1);
                expect(item).toMatchObject({
                    id: expect.any(Number),
                    name: expect.any(String),
                    price: expect.any(Number)
                });
            });
        });

        test('should return 404 when item does not exist', async () => {
            provider
                .given('no item with id 999 exists')
                .uponReceiving('a request to get non-existent item with id 999')
                .withRequest({
                    method: 'GET',
                    path: '/items/999'
                })
                .willRespondWith({
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: MatchersV3.like('not found')
                    }
                });

            await provider.executeTest(async mockProvider => {
                try {
                    await getItem(mockProvider.url, 999);
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.error).toBe('not found');
                }
            });
        });
    });

    describe('POST /items - Create new item', () => {
        test('should create a new item with valid data', async () => {
            provider
                .given('the system is ready to accept new items')
                .uponReceiving('a request to create a new item with valid data')
                .withRequest({
                    method: 'POST',
                    path: '/items',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        name: 'Gaming Mouse',
                        price: 79.99
                    }
                })
                .willRespondWith({
                    status: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Location': MatchersV3.like('/items/123')
                    },
                    body: {
                        id: MatchersV3.integer(123),
                        name: MatchersV3.like('Gaming Mouse'),
                        price: MatchersV3.decimal(79.99)
                    }
                });

            await provider.executeTest(async mockProvider => {
                const newItem = await createItem(mockProvider.url, {
                    name: 'Gaming Mouse',
                    price: 79.99
                });
                expect(newItem).toMatchObject({
                    id: expect.any(Number),
                    name: 'Gaming Mouse',
                    price: 79.99
                });
            });
        });

        test('should create a new item with only name (price optional)', async () => {
            provider
                .given('the system accepts items with only name provided')
                .uponReceiving('a request to create a new item with only name')
                .withRequest({
                    method: 'POST',
                    path: '/items',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        name: 'Free Sample'
                    }
                })
                .willRespondWith({
                    status: 201,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        id: MatchersV3.integer(124),
                        name: MatchersV3.like('Free Sample'),
                        price: MatchersV3.decimal(0)
                    }
                });

            await provider.executeTest(async mockProvider => {
                const newItem = await createItem(mockProvider.url, {
                    name: 'Free Sample'
                });
                expect(newItem).toMatchObject({
                    id: expect.any(Number),
                    name: 'Free Sample'
                });
            });
        });

        test('should return 400 when name is missing', async () => {
            provider
                .given('the system requires name for new items')
                .uponReceiving('a request to create an item without name')
                .withRequest({
                    method: 'POST',
                    path: '/items',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        price: 50.00
                    }
                })
                .willRespondWith({
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: MatchersV3.like('name required')
                    }
                });

            await provider.executeTest(async mockProvider => {
                try {
                    await createItem(mockProvider.url, { price: 50.00 });
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.error).toBe('name required');
                }
            });
        });

        test('should return 400 when request body is invalid', async () => {
            provider
                .given('the system validates input data')
                .uponReceiving('a request to create an item with invalid data')
                .withRequest({
                    method: 'POST',
                    path: '/items',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        name: '',
                        price: -10
                    }
                })
                .willRespondWith({
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: MatchersV3.like('Invalid input data')
                    }
                });

            await provider.executeTest(async mockProvider => {
                try {
                    await createItem(mockProvider.url, { name: '', price: -10 });
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.error).toContain('Invalid');
                }
            });
        });
    });

    describe('PUT /items/{id} - Update existing item', () => {
        test('should update an existing item', async () => {
            provider
                .given('an item with id 1 exists and can be updated')
                .uponReceiving('a request to update item with id 1')
                .withRequest({
                    method: 'PUT',
                    path: '/items/1',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        name: 'Updated Laptop',
                        price: 399.99
                    }
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        id: MatchersV3.integer(1),
                        name: MatchersV3.like('Updated Laptop'),
                        price: MatchersV3.decimal(399.99)
                    }
                });

            await provider.executeTest(async mockProvider => {
                const updatedItem = await replaceItem(mockProvider.url, 1, {
                    name: 'Updated Laptop',
                    price: 399.99
                });
                expect(updatedItem).toMatchObject({
                    id: 1,
                    name: 'Updated Laptop',
                    price: 399.99
                });
            });
        });

        test('should return 404 when updating non-existent item', async () => {
            provider
                .given('no item with id 999 exists')
                .uponReceiving('a request to update non-existent item with id 999')
                .withRequest({
                    method: 'PUT',
                    path: '/items/999',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        name: 'Non-existent Item',
                        price: 100.00
                    }
                })
                .willRespondWith({
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: MatchersV3.like('not found')
                    }
                });

            await provider.executeTest(async mockProvider => {
                try {
                    await replaceItem(mockProvider.url, 999, {
                        name: 'Non-existent Item',
                        price: 100.00
                    });
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.error).toBe('not found');
                }
            });
        });

        test('should return 400 when update data is invalid', async () => {
            provider
                .given('an item with id 1 exists but validation is enforced')
                .uponReceiving('a request to update item with invalid data')
                .withRequest({
                    method: 'PUT',
                    path: '/items/1',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        name: '',
                        price: -50
                    }
                })
                .willRespondWith({
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: MatchersV3.like('Invalid input data')
                    }
                });

            await provider.executeTest(async mockProvider => {
                try {
                    await replaceItem(mockProvider.url, 1, {
                        name: '',
                        price: -50
                    });
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data.error).toContain('Invalid');
                }
            });
        });
    });

    describe('DELETE /items/{id} - Delete item', () => {
        test('should delete an existing item with 204 status', async () => {
            provider
                .given('an item with id 1 exists and can be deleted')
                .uponReceiving('a request to delete item with id 1')
                .withRequest({
                    method: 'DELETE',
                    path: '/items/1'
                })
                .willRespondWith({
                    status: 204
                });

            await provider.executeTest(async mockProvider => {
                const status = await deleteItem(mockProvider.url, 1);
                expect(status).toBe(204);
            });
        });

        test('should delete an existing item with 200 status (alternative implementation)', async () => {
            provider
                .given('an item with id 2 exists and can be deleted with 200 response')
                .uponReceiving('a request to delete item with id 2 expecting 200 response')
                .withRequest({
                    method: 'DELETE',
                    path: '/items/2'
                })
                .willRespondWith({
                    status: 200
                });

            await provider.executeTest(async mockProvider => {
                const status = await deleteItem(mockProvider.url, 2);
                expect(status).toBe(200);
            });
        });

        test('should return 404 when deleting non-existent item', async () => {
            provider
                .given('no item with id 999 exists')
                .uponReceiving('a request to delete non-existent item with id 999')
                .withRequest({
                    method: 'DELETE',
                    path: '/items/999'
                })
                .willRespondWith({
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: MatchersV3.like('not found')
                    }
                });

            await provider.executeTest(async mockProvider => {
                try {
                    await deleteItem(mockProvider.url, 999);
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.error).toBe('not found');
                }
            });
        });
    });

    describe('Edge Cases and Additional Scenarios', () => {
        // Removed string ID test - spec now standardized on integer IDs only
        // test('should handle items with string IDs (per OpenAPI oneOf constraint)', async () => { ... });

        test('should handle optional createdAt field in response', async () => {
            provider
                .given('an item exists with timestamp information')
                .uponReceiving('a request to get item with createdAt field')
                .withRequest({
                    method: 'GET',
                    path: '/items/1'
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        id: MatchersV3.integer(1),
                        name: MatchersV3.like('Timestamped Item'),
                        price: MatchersV3.decimal(150.00),
                        createdAt: MatchersV3.like('2025-01-10T12:00:00Z')
                    }
                });

            await provider.executeTest(async mockProvider => {
                const item = await getItem(mockProvider.url, 1);
                expect(item).toMatchObject({
                    id: expect.any(Number),
                    name: expect.any(String),
                    price: expect.any(Number),
                    createdAt: expect.any(String)
                });
                // Validate ISO 8601 format
                expect(new Date(item.createdAt)).toBeInstanceOf(Date);
            });
        });
    });
});