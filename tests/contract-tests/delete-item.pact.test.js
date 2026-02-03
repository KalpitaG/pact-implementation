import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { deleteItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'WebConsumer',
    provider: 'ItemsAPI',
});

describe('deleteItem Pact Tests', () => {
    test('should delete an item', async () => {
        provider
            .given('an item with ID 1 exists')
            .uponReceiving('a request to delete an item')
            .withRequest({
                method: 'DELETE',
                path: '/items/1',
            })
            .willRespondWith({
                status: 204,
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await deleteItem(mockProvider.url, '1');
            expect(result).toBe(204);
        });
    });
});