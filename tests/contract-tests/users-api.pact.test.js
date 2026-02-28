import path from 'path';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { getUserById, getUserProfile } from '../../src/consumer.js';
import { describe, test, expect } from '@jest/globals';

const { like, string, integer } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'pact-provider-demo'
});

describe('Users API Contract', () => {
    test('get a user by ID', async () => {
        provider
            .given('user 1 exists')
            .uponReceiving('a request to get a user by ID')
            .withRequest({ method: 'GET', path: '/users/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: like({
                    id: integer(1),
                    username: string('testuser'),
                    role: string('user')
                })
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
        });
    });

    test('get a non-existent user by ID', async () => {
        provider
            .given('user 999 does not exist')
            .uponReceiving('a request to get a non-existent user by ID')
            .withRequest({ method: 'GET', path: '/users/999' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: like({ message: string('User not found') })
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, 999);
            expect(result).toBeNull();
        });
    });

    test('get a user profile by ID', async () => {
        provider
            .given('user 1 exists with a profile')
            .uponReceiving('a request to get a user profile by ID')
            .withRequest({ method: 'GET', path: '/users/1/profile' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: like({
                    id: integer(1),
                    username: string('testuser'),
                    email: string('test@example.com'),
                    role: string('user')
                })
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.email).toEqual('test@example.com');
        });
    });

    test('get a non-existent user profile by ID', async () => {
        provider
            .given('user 999 does not exist')
            .uponReceiving('a request to get a non-existent user profile by ID')
            .withRequest({ method: 'GET', path: '/users/999/profile' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: like({ message: string('User profile not found') })
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, 999);
            expect(result).toBeNull();
        });
    });
});