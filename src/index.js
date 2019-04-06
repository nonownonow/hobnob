import '@babel/polyfill';
import http from 'http';

const PAYLOAD_LIMIT = 1e6;
function requestHandler(req, res) {
  if (req.method === 'POST' && req.url === '/users') {
    const payloads = [];
    req.on('data', (data) => {
      payloads.push(data);
      const bodyString = Buffer.concat(payloads).toString();
      if (bodyString.length > PAYLOAD_LIMIT) {
        res.setHeader(413, { 'Content-Type': 'text/plain' });
        res.end();
        res.connection.destroy();
      }
    });
    req.on('end', () => {
      if (payloads.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Payload should not be empty',
        }));
        return;
      }
      if (req.headers['content-type'] !== 'application/json') {
        res.writeHead(415, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'The "Content-Type" header must always be "application/json"',
        }));
      } else {
        try {
          JSON.parse(payloads.join('').toString());
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Payload should be in JSON format',
          }));
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello, World!');
      }
    });
  }
}

const server = http.createServer(requestHandler);
server.listen(8080);
