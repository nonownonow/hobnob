import '@babel/polyfill';
import express from 'express';
import bodyparser from 'body-parser';
import elasticsearch from 'elasticsearch';
import { checkContentTypeJSON } from './middlewares/check-content-type-is-json';
import { checkContentTypeIsSet } from './middlewares/check-content-type-is-set';
import { checkEmptyPayload } from './middlewares/check-empty-playload';
import { errorHandler } from './middlewares/error-handler';
import { createUser } from './handlers/users/create';
import { injectHandlerDependencies } from './utils';

const client = elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
});

const PAYLOAD_LIMIT = 1e6;
const app = express();
app.use(bodyparser.json({ limit: PAYLOAD_LIMIT }));


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
app.use(checkContentTypeIsSet);
app.use(checkContentTypeJSON);

app.post('/users', injectHandlerDependencies(createUser, client));

// app.post('/users', (req, res) => console.log('users'));
app.use(errorHandler);

app.listen(process.env.SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Hobnob API server listening on port ${process.env.SERVER_PORT}!`);
});
