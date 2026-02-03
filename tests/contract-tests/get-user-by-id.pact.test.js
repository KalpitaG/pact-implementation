import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getUserById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'WebConsumer',
    provider: 'UsersAPI',
});

describe('getUserById Pact Tests', () => {
    test('should get a user by ID', async () => {
        provider
            .given('a user with ID 123 exists')
            .uponReceiving('a request to get a user by ID')
            .withRequest({
                method: 'GET',
                path: '/users/123',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Example User'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '123');
            expect(result).toBeDefined();
            expect(result.id).toBe(123);
        });
    });

    test('should return null when user does not exist', async () => {
        provider
            .given('no user with ID 999 exists')
            .uponReceiving('a request to get a non-existent user')
            .withRequest({
                method: 'GET',
                path: '/users/999',
            })
            .willRespondWith({
                status: 404,
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '999');
            expect(result).toBeNull();
        });
    });
});