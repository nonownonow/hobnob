import '@babel/polyfill';
import express from 'express';
import bodyparser from 'body-parser';
import elasticsearch from 'elasticsearch';

console.log(process.env.ELASTICSEARCH_INDEX);

const client = elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
});

const PAYLOAD_LIMIT = 1e6;
const app = express();
app.use(bodyparser.json({ limit: PAYLOAD_LIMIT }));

function checkEmptyPayload(req, res, next) {
  if (
    ['POST', 'PATCH', 'PUT'].includes(req.method)
    && req.headers['content-length'] === '0'
  ) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'Payload should not be empty',
    });
  }
  next();
}

function checkContentTypeHeader(req, res, next) {
  if (!req.headers['content-type']) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The "Content-Type" header must be set for requests with a non-empty payload',
    });
  }
  next();
}

function checkContentTypeJSON(req, res, next) {
  if (req.headers['content-type'] !== 'application/json') {
    res.status(415);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The "Content-Type" header must always be "application/json"',
    });
  }
  next();
}
app.use((req, res, next) => {
  const CLIENT_PROTOCOL = 'http';
  const CLIENT_HOSTNAME = '127.0.0.1';
  const CLIENT_PORT = '8200';
  const allowedOrigins = [
    `${CLIENT_PROTOCOL}://${CLIENT_HOSTNAME}`,
    `${CLIENT_PROTOCOL}://${CLIENT_HOSTNAME}:${CLIENT_PORT}`,
  ];
  if (allowedOrigins.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(checkEmptyPayload);
app.use(checkContentTypeHeader);
app.use(checkContentTypeJSON);

app.post('/users', (req, res) => {
  const requiredField = ['email', 'password'];
  if (!requiredField.every(field => Object.hasOwnProperty.call(req.body, field))) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'Payload must contain at least the email and password fields',
    });
  }
  if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The email and password fields must be of type string',
    });
  }
  if (!/^[\w.+]+@\w+\.\w+$/.test(req.body.email)) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The email field must be a valid email',
    });
  }
  res.status(201);
  client.index({
    index: 'hobnob',
    type: 'user',
    body: req.body,
  })
    .then((result) => {
      console.log(result);

      res.set('Content-Type', 'text/plain');
      res.send(result._id);
      return result;
    })
    .catch(() => {
      res.status(500);
      res.set('Content-Type', 'application/json');
      res.json({ message: 'Internal Server Error' });
    });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err && err.type === 'entity.parse.failed') {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'Payload should be in JSON format',
    });
    return;
  }
  next();
});

app.listen(process.env.SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Hobnob API server listening on port ${process.env.SERVER_PORT}!`);
});
