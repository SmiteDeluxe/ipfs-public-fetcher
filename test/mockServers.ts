const http = require('http');

export const server1 = http.createServer((req, res) => {
  let timeout;
  const startTime = Date.now();
  // console.log(`Server1 received request for ${req.url} at ${startTime}`);

  req.on('close', () => {
    clearTimeout(timeout);
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  if (req.url === '/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m') {
    res.end('Hello from IPFS Gateway Checker');
    // console.log(`Server1 responding with 'Hello' at ${Date.now()} (elapsed: ${Date.now() - startTime}ms)`);
  } else if (req.url === '/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m/delay500.png') {
    timeout = setTimeout(() => {
      res.end('Some random content with 1000ms delay');
      // console.log(`Server1 responding to delay500 at ${Date.now()} (elapsed: ${Date.now() - startTime}ms)`);
    }, 1000); // 1000ms delay
  } else if (req.url === '/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m/delay10000.png') {
    timeout = setTimeout(() => {
      res.end('Some random content with 100000ms delay');
      // console.log(`Server1 responding to delay10000 at ${Date.now()} (elapsed: ${Date.now() - startTime}ms)`);
    }, 10000); // 10000ms delay
  } else {
    res.end('Some random content');
  }
});

export const server2 = http.createServer((req, res) => {
  let timeout;
  const startTime = Date.now();
  // console.log(`Server2 received request for ${req.url} at ${startTime}`);

  req.on('close', () => {
    clearTimeout(timeout);
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  if (req.url === '/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m') {
    res.end('Hello from IPFS Gateway Checker');
    // console.log(`Server2 responding with 'Hello' at ${Date.now()} (elapsed: ${Date.now() - startTime}ms)`);
  } else if (req.url === '/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m/delay500.png') {
    timeout = setTimeout(() => {
      res.end('Some random content with 500ms delay');
      // console.log(`Server2 responding to delay500 at ${Date.now()} (elapsed: ${Date.now() - startTime}ms)`);
    }, 500); // 500ms delay
  } else if (req.url === '/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m/delay10000.png') {
    timeout = setTimeout(() => {
      res.end('Some random content with 100000ms delay');
      // console.log(`Server2 responding to delay10000 at ${Date.now()} (elapsed: ${Date.now() - startTime}ms)`);
    }, 10000); // 10000ms delay
  } else {
    res.end('Some random content');
  }
});
