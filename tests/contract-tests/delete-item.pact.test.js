import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { deleteItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'ItemsAPI',
});

describe('Consumer Pact Tests', () => {
    test('should delete an existing item', async () => {
        provider
            .given('an item with id 123 exists')
            .uponReceiving('a request to delete item with id 123')
            .withRequest({ method: 'DELETE', path: '/items/123' })
            .willRespondWith({
                status: 204
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await deleteItem(mockProvider.url, '123');
            expect(result).toBe(204);
        });
    });
});