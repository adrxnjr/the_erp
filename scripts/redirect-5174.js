const http = require('http');

const server = http.createServer((req, res) => {
  const target = `http://localhost:5173${req.url}`;
  res.writeHead(302, {
    'Location': target,
    'Access-Control-Allow-Origin': '*',
  });
  res.end(`Redirecting to ${target}`);
});

server.listen(5174, '0.0.0.0', () => {
  console.log('Port 5174 redirector to 5173 running on http://localhost:5174');
});

