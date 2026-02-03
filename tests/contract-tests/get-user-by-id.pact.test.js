import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getUserById } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'UserConsumer',
    provider: 'UserProvider',
});

describe('getUserById Pact Tests', () => {
    test('should return a user by id', async () => {
        provider
            .given('a user with id 456 exists')
            .uponReceiving('a request to get user with id 456')
            .withRequest({
                method: 'GET',
                path: '/users/456',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .willRespondWith({
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    id: MatchersV3.integer(456),
                    name: MatchersV3.string('Test User')
                }
            });

        await provider.executeTest(async (mockProvider) => {
            const user = await getUserById(mockProvider.url, '456');
            expect(user).toBeDefined();
            expect(user.id).toBe(456);
        });
    });

    test('should return null if user does not exist', async () => {
        provider
            .given('no user with id 999 exists')
            .uponReceiving('a request to get user with id 999')
            .withRequest({
                method: 'GET',
                path: '/users/999',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .willRespondWith({
                status: 404
            });

        await provider.executeTest(async (mockProvider) => {
            const user = await getUserById(mockProvider.url, '999');
            expect(user).toBeNull();
        });
    });
});