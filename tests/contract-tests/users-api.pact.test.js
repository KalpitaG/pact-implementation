import path from 'path';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { getUserById, getUserProfile } from '../../src/consumer.js';
import { describe, test, expect } from '@jest/globals';

const { like, string, integer } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'pact-implementation',
    provider: 'pact-provider-demo',
});

describe('Users API Contract', () => {
    test('get public user info by ID', async () => {
        provider
            .given('user with ID 1 exists')
            .uponReceiving('a request to get public user info by ID')
            .withRequest({ method: 'GET', path: '/users/1' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    username: string('testuser'),
                    role: string('user')
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
            expect(result).not.toHaveProperty('email');
        });
    });

    test('get public user info for a non-existent ID returns null', async () => {
        provider
            .given('user with ID 999 does not exist')
            .uponReceiving('a request to get public user info for a non-existent ID')
            .withRequest({ method: 'GET', path: '/users/999' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { message: string('User not found') }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, 999);
            expect(result).toBeNull();
        });
    });

    test('get full user profile by ID', async () => {
        provider
            .given('user with ID 1 exists')
            .uponReceiving('a request to get full user profile by ID')
            .withRequest({ method: 'GET', path: '/users/1/profile' })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    username: string('testuser'),
                    email: string('test@example.com'),
                    role: string('user')
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, 1);
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
            expect(result).toHaveProperty('email');
        });
    });

    test('get full user profile for a non-existent ID returns null', async () => {
        provider
            .given('user with ID 999 does not exist')
            .uponReceiving('a request to get full user profile for a non-existent ID')
            .withRequest({ method: 'GET', path: '/users/999/profile' })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { message: string('User profile not found') }
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, 999);
            expect(result).toBeNull();
        });
    });
});
