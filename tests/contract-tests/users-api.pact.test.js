import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { describe, test, expect } from "@jest/globals";
import { getUserById, getUserProfile } from "../../src/consumer.js";

const { like, integer, string } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Example App',
    provider: 'Example API',
});

describe('User API Pact Tests', () => {
    test('should get public user info by ID', async () => {
        provider
            .given('a user with ID 1 exists')
            .uponReceiving('a request to get public user info by ID')
            .withRequest({
                method: 'GET',
                path: '/users/1',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    username: string('testuser'),
                    role: string('customer'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
            expect(result.username).toEqual('testuser');
            expect(result.role).toEqual('customer');
            expect(result.email).toBeUndefined(); // Email should not be returned by this endpoint
        });
    });

    test('should return null for a non-existent user ID (public info)', async () => {
        provider
            .given('no user with ID 999 exists')
            .uponReceiving('a request to get public user info for a non-existent ID')
            .withRequest({
                method: 'GET',
                path: '/users/999',
            })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { message: string('User not found') },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserById(mockProvider.url, '999');
            expect(result).toBeNull();
        });
    });

    test('should get full user profile by ID', async () => {
        provider
            .given('a user with ID 1 exists and has a profile')
            .uponReceiving('a request to get full user profile by ID')
            .withRequest({
                method: 'GET',
                path: '/users/1/profile',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(1),
                    username: string('testuser'),
                    email: string('test@example.com'),
                    role: string('customer'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, '1');
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
            expect(result.email).toEqual('test@example.com');
        });
    });

    test('should return null for a non-existent user ID (full profile)', async () => {
        provider
            .given('no user with ID 999 exists')
            .uponReceiving('a request to get full user profile for a non-existent ID')
            .withRequest({
                method: 'GET',
                path: '/users/999/profile',
            })
            .willRespondWith({
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: { message: string('User profile not found') },
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getUserProfile(mockProvider.url, '999');
            expect(result).toBeNull();
        });
    });
});