import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getUserById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'UserConsumer',
    provider: 'UserProvider',
});

describe('Consumer Pact Tests for getUserById', () => {
    test('should return a user when it exists', async () => {
        provider
            .given('a user with ID 123 exists')
            .uponReceiving('a request to get a user by ID')
            .withRequest({ method: 'GET', path: '/users/123' })
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

    test('should return null when the user does not exist', async () => {
        provider
            .given('no user with ID 456 exists')
            .uponReceiving('a request to get a user by ID')
            .withRequest({ method: 'GET', path: '/users/456' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: {"error": "User not found"},
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '456');
            expect(result).toBeNull();
        });
    });
});