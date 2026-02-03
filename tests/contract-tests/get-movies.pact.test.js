import path from 'path';
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { getMovies } from "../../src/consumer.js";
import { describe, test, expect } from "@jest/globals";

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'WebConsumer',
    provider: 'MoviesAPI',
});

describe('Consumer Pact Tests', () => {
    test('should get all movies', async () => {
        provider
            .given('movies exist')
            .uponReceiving('a request to get all movies')
            .withRequest({
                method: 'GET',
                path: '/movies',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: MatchersV3.eachLike({
                    id: MatchersV3.integer(123),
                    title: MatchersV3.string('Example Movie'),
                }),
            });

        await provider.executeTest(async (mockProvider) => {
            const result = await getMovies(mockProvider.url);
            expect(result).toBeDefined();
            expect(result[0].id).toBe(123);
        });
    });
});