import '@babel/polyfill';
import express from 'express';
import bodyparser from 'body-parser';

const PAYLOAD_LIMIT = 1e6;
require('dotenv').config();

const app = express();

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
function checkMissingField(req, res, next) {
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
app.use(checkEmptyPayload);
app.use(checkContentTypeHeader);
app.use(checkContentTypeJSON);
app.use(bodyparser.json({ limit: PAYLOAD_LIMIT }));
app.post('/users', checkMissingField);

app.post('/users', (req, res, next) => next());

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
