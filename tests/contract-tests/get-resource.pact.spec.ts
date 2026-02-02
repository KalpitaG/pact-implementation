import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

const { eachLike, like, integer, string } = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'ConsumerService',
    provider: 'ProviderService',
});

describe('Consumer Pact Tests', () => {
    it('should get resource', async () => {
        provider
            .given('a resource exists')
            .uponReceiving('a request for resource')
            .withRequest({
                method: 'GET',
                path: '/resource/123',
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id: integer(123),
                    name: string('example'),
                },
            });

        await provider.executeTest(async (mockProvider) => {
            const client = new ApiClient(mockProvider.url);
            const result = await client.getResource('123');
            expect(result).toBeDefined();
            expect(result.id).toBe(123);
        });
    });
});