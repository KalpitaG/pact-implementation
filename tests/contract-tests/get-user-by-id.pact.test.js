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
    test('should get a user by id', async () => {
        provider
            .given('a user with id 1 exists')
            .uponReceiving('a request to get user with id 1')
            .withRequest({ method: 'GET', path: '/users/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { id: 1, username: 'testuser', role: 'admin' },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });

    test('should return null when user does not exist', async () => {
        provider
            .given('no user with id 2 exists')
            .uponReceiving('a request to get user with id 2')
            .withRequest({ method: 'GET', path: '/users/2' })
            .willRespondWith({
                status: 404
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '2');
            expect(result).toBeNull();
        });
    });
});