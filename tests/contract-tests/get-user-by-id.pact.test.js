import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getUserById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    test('should get a user by id', async () => {
        provider
            .given('a user with id 123 exists')
            .uponReceiving('a request to get user with id 123')
            .withRequest({ method: 'GET', path: '/users/123' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: MatchersV3.integer(123),
                    name: MatchersV3.string('Test User'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, 123);
            expect(result).toBeDefined();
            expect(result.id).toBe(123);
        });
    });

    test('should return null when user is not found', async () => {
        provider
            .given('no user with id 999 exists')
            .uponReceiving('a request to get user with id 999')
            .withRequest({ method: 'GET', path: '/users/999' })
            .willRespondWith({
                status: 404,
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, 999);
            expect(result).toBeNull();
        });
    });
});