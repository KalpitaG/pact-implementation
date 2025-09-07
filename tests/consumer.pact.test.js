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

const EXPECTED_ITEM_BODY = {id: 1, name: "Alpha", price: 10}

describe('Items Service', () => {

    describe('When a GET request is made to /items', () => {
        test('it should return a list of all the items', async () => {
            provider
                .given(
                    'items exist')
                .uponReceiving(
                    'a request to return all items'
                )
                .withRequest({
                    method: 'GET',
                    path: '/items'
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: MatchersV3.eachLike(EXPECTED_ITEM_BODY),
                })

            await provider.executeTest(async mockProvider => {
                const items = await listItems(mockProvider.url);
                expect(Array.isArray(items)).toBe(true);
                expect(items.length).toBeGreaterThan(0);
                expect(items[0]).toEqual(EXPECTED_ITEM_BODY);
            })
        });

        test('it should return items by id', async () => {
            provider
                .given(
                    'the item for that id exists'
                )
                .uponReceiving(
                    'a request to return an item of a specific id'
                )
                .withRequest({
                    method: 'GET',
                    path: '/items/1'
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: EXPECTED_ITEM_BODY,
                });

            await provider.executeTest(async mockProvider => {
                const item = await getItem(mockProvider.url, 1);
                expect(item).toEqual(EXPECTED_ITEM_BODY);
            })
        });

        test('it should return the correct error message when no item exists for a particular id', async () => {
            provider
                .given(
                    'an item does not exist for the specified id'
                )
                .uponReceiving(
                    'a request to return an item with id 9'
                )
                .withRequest({
                    method: 'GET',
                    path: '/items/9'
                })
                .willRespondWith({
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        error: MatchersV3.like('not found'),
                    }
                })

            await provider.executeTest(async mockProvider => {
                try {
                    await getItem(mockProvider.url, 9);
                    expect(true).toBe(false);
                } catch (error) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.error).toBe('not found');
                }
            })
        });
    });

    describe('When a POST request is made to the /items', () => {
        test('it should create a new item when name is specified', async () => {
            provider
                .given(
                    'a name is provided for the item that needs to be added'
                )
                .uponReceiving(
                    'a request to add a new item to the database'
                )
                .withRequest({
                    method: 'POST',
                    path: '/items',
                    body: {name: "Laptop", price: 200},
                    headers: {
                        'content-Type': 'application/json'
                    },
                })
                .willRespondWith({
                    status: 201,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        id: MatchersV3.integer(3),
                        name: MatchersV3.like("Laptop"),
                        price: MatchersV3.integer(200)
                    }
                })

            await provider.executeTest(async (mockProvider) => {
                const newItem = await createItem(mockProvider.url, {name: 'Laptop', price: 200});
                expect(newItem).toEqual({id: expect.any(Number), name: "Laptop", price: 200});
            })
        });
    });

    test('it should return the correct status code and error message when an item with no name is created', async () => {
        await provider
            .given(
                'no name is given when a new item is created'
            )
            .uponReceiving(
                'a request add or create a new item without name'
            )
            .withRequest({
                method: 'POST',
                path: '/items',
                body: {
                    price: 200
                },
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .willRespondWith({
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    error: MatchersV3.like('name required')
                }
            })
            .executeTest(async (mockProvider) => {
                try {
                    await createItem(mockProvider.url, {price: 200});
                    expect(true).toBe(false);
                } catch (error) {
                    expect(error.response.status).toBe(400)
                    expect(error.response.data.error).toBe('name required')
                }
            });
    });

    describe ('When a PUT request is made to the /items', () => {
        test ('it should replace the already existing item', async () => {
            await provider
                .given(
                    'an item with that id exists and can be replaced'
                )
                .uponReceiving(
                    'a request to replace the parameters of the item'
                )
                .withRequest({
                    method: 'PUT',
                    path: '/items/1',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {name: 'Mobile', price:100}
                })
                .willRespondWith({
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body:{
                            id: MatchersV3.integer(1),
                            name: MatchersV3.like('Mobile'),
                            price: MatchersV3.integer(100)
                    }
                })
                .executeTest(async (mockProvider) => {
                    const replacedItem = await replaceItem(mockProvider.url, 1, {name: 'Mobile', price:100});
                    expect(replacedItem.id).toBe(1);
                    expect(replacedItem.name).toBe('Mobile');
                    expect(replacedItem.price).toBe(100);
                })
        });
    });


});


