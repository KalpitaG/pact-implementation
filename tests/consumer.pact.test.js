// tests/consumer.pact.test.js (CommonJS)
const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { fetchUsers, createUser } = require('../src/consumer');

const provider = new PactV3({
  consumer: 'FrontendApp',
  provider: 'UserAPI',
  dir: path.resolve(process.cwd(), 'pacts'),
});

const EXPECTED_BODY = { id: 1, name: 'User name' };
const NEW_USER = { id: 2, name:"Kalpita"}

describe('Pact Consumer: UserAPI', () => {
  describe('When a GET request is made to /users', () => {
    test('it should return all users', async () => {
      await provider
        .uponReceiving('a request to fetch all users')
        .withRequest({ method: 'GET', path: '/users' })
        .willRespondWith({
          status: 200,
          body: MatchersV3.eachLike(EXPECTED_BODY),
        })
        .executeTest(async (mock) => {
          const users = await fetchUsers(mock.url);
          expect(users[0]).toEqual(EXPECTED_BODY);
        });
    });

    test('it should create a new user', async () => {
        await provider
            .uponReceiving('a request to create a new user Kalpita')
            .withRequest({ method: 'POST', path: '/users', headers: {"Content-Type": "application/json"}, body: {name: 'Kalpita'},})
            .willRespondWith({
            status: 201,
body: {
            id: MatchersV3.integer(2),   // type: integer; example value 2
            name: MatchersV3.like('Kalpita'),
          },
          })
          .executeTest(async (mock) => {
            const created = await createUser(mock.url, 'Kalpita')
            expect(created.name).toBe("Kalpita");
            expect(typeof created.id).toBe("number");
          });
    });

  });
});
