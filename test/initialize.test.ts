// const {server1, server2} = require('./mockServers');
// const {Initialize, IsConnected, FetchContent} = require('../src')
import { server1, server2 } from "./mockServers"
import { Initialize, IsConnected, FetchContent } from "../src"

jest.setTimeout(7000)

describe('Testing Initialize using two mock domains', () => {
  let app1, app2;

  beforeAll((done) => {
    server1.listen(3000, () => {
      app1 = `http://localhost:${server1.address().port}/`;
      server2.listen(3001, () => {
        app2 = `http://localhost:${server2.address().port}/`;
        done();
      });
    });
  });

  afterAll((done) => {
    server1.close(() => {
      server2.close(() => {
        done();
      });
    });
  });

  test('Should return "Hello from IPFS Gateway Checker" on server 1"', async () => {
    // const before = performance.now()
    const res = await fetch(`${app1}bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m`);
    // expect(performance.now()-before).toBeGreaterThan(500)
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello from IPFS Gateway Checker');
  });

  test('Should return "Hello from IPFS Gateway Checker" on server 2"', async () => {
    const res = await fetch(`${app2}bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello from IPFS Gateway Checker');
  });

  test('Should run and detect connection after some time', async () => {
    await Initialize(
      {
        customDomains: [
          `${app1}:hash`,
          `${app2}:hash`
        ],
        verbose: true,
      })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(IsConnected()).toBe(true);
  });

  test('Will check response delay.', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second for moch servers to finish up from previous test
    const before = performance.now()
    const content = await FetchContent('bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m/delay500.png')
    expect(performance.now() - before).toBeGreaterThan(500)
    expect(content).toBe(`${app2}bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m/delay500.png`)
  });

  test('Will search for content not returning in time.', async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second for moch servers to finish up from previous test
    await expect(
      FetchContent('bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m/delay10000.png', 1)
    ).rejects.toThrow(/Failed/);
  });  
});