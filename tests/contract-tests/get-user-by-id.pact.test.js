import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getUserById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'UsersAPI',
});

describe('getUserById Pact Tests', () => {
    test('should get a user by ID when it exists', async () => {
        provider
            .given('a user with ID 1 exists')
            .uponReceiving('a request to get a user by ID')
            .withRequest({ method: 'GET', path: '/users/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(1),
                    name: MatchersV3.string('Test User')
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });

    test('should return null when user ID does not exist', async () => {
        provider
            .given('no user with ID 99 exists')
            .uponReceiving('a request to get a user by ID that does not exist')
            .withRequest({ method: 'GET', path: '/users/99' })
            .willRespondWith({
                status: 404
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '99');
            expect(result).toBeNull();
        });
    });
});