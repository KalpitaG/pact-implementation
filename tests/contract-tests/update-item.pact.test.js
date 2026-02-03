import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { updateItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'WebConsumer',
    provider: 'ItemsAPI',
});

describe('updateItem Pact Tests', () => {
    test('should update an existing item', async () => {
        provider
            .given('an item with ID 1 exists')
            .uponReceiving('a request to update an item')
            .withRequest({
                method: 'PATCH',
                path: '/items/1',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    name: 'Patched Item',
                },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Patched Item'),
                    price: MatchersV3.number(9.99),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const patch = { name: 'Patched Item' };
            const result = await updateItem(mockProvider.url, '1', patch);
            expect(result).toBeDefined();
            expect(result.name).toBe('Patched Item');
        });
    });
});