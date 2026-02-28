import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { updateItem } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('updateItem Pact Tests', () => {
    test('should update an existing item', async () => {
        provider
            .given('an item with ID 123 exists')
            .uponReceiving('a request to update item 123')
            .withRequest({ method: 'PATCH', path: '/items/123', headers: { 'Content-Type': 'application/json' }, body: { name: 'New Laptop Name' } })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { id: MatchersV3.integer(123), name: MatchersV3.string('New Laptop Name'), price: MatchersV3.integer(1200) },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await updateItem(mockProvider.url, '123', { name: 'New Laptop Name' });
            expect(result).toBeDefined();
            expect(result.name).toBe('New Laptop Name');
        });
    });
});