import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getUserProfile } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('getUserProfile Pact Tests', () => {
    test('should get a user profile', async () => {
        provider
            .given('a user with id 1 exists')
            .uponReceiving('a request to get user profile with id 1')
            .withRequest({ method: 'GET', path: '/users/1/profile' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { id: 1, username: 'testuser', email: 'test@example.com', role: 'admin' },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });

    test('should return null when user does not exist', async () => {
        provider
            .given('no user with id 2 exists')
            .uponReceiving('a request to get user profile with id 2')
            .withRequest({ method: 'GET', path: '/users/2/profile' })
            .willRespondWith({
                status: 404
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, '2');
            expect(result).toBeNull();
        });
    });
});