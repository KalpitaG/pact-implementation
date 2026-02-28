import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getUserById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('getUserById Pact Tests', () => {
    test('should return a user', async () => {
        provider
            .given('a user with ID 123 exists')
            .uponReceiving('a request to get user 123')
            .withRequest({ method: 'GET', path: '/users/123' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { id: MatchersV3.integer(123), username: MatchersV3.string('testuser'), role: MatchersV3.string('admin') },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.id).toBe(123);
        });
    });
});