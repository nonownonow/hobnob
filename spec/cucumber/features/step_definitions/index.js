import superagent from 'superagent';
import { When, Then } from 'cucumber';
import assert from 'assert';
import elasticsearch from 'elasticsearch';
import { convertStringToArray, getValidPayload } from './utils';

const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
});

When(/the client creates a (POST|GET|DELETE|PUT|PATCH|OPTIONS|HEAD) request to ([/\w-:.]+)/, function (method, path) {
  this.request = superagent(method, `${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}${path}`);
});

When(/attaches a generic (.+) payload/, function (payloadType) {
  switch (payloadType) {
    case 'non-JSON':
      this.request.send('<?xml version="1.0" encoding="UTF-8" ?><email>dan@danyll.com</email>');
      this.request.set('Content-Type', 'text/xml');
      break;
    case 'malformed':
      this.request.send('{"email": "dan@danyll.com", name: }');
      this.request.set('Content-Type', 'application/json');
      break;
    case 'empty':
    default:
      return undefined;
  }
});

When(/attaches an? (.+) payload which is missing the (.+) field/, function (payloadType, missingFields) {
  const payload = {
    email: 'e@ma.il',
    password: 'password',
  };
  const fieldToDelete = missingFields.split(',').map(s => s.trim()).filter(s => s !== '');
  fieldToDelete.forEach(field => delete payload[field]);
  this.request
    .send(JSON.stringify(payload))
    .set('Content-Type', 'application/json');
});

When(/^sends the request$/, function (callback) {
  this.request
    .then((response) => {
      this.response = response.res;
      callback();
    })
    .catch((error) => {
      this.response = error.response;
      callback();
    });
});

Then(/our API should respond with a (\d+) HTTP status code/, function (statusCode) {
  assert.equal(this.response.statusCode, statusCode);
});

Then(/^the payload of the response should be an? ([a-zA-Z0-9, ]+)$/, function (payloadType) {
  // Check Content-Type header
  const contentType = this.response.headers['Content-Type'] || this.response.headers['content-type'];
  if (payloadType === 'JSON object') {
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response not of Content-Type application/json');
    }
    try {
      this.responsePayload = JSON.parse(this.response.text);
    } catch (err) {
      throw new Error('Response not a valid JSON object');
    }
  } else if (payloadType === 'string') {
    if (!contentType || !contentType.includes('text/plain')) {
      throw new Error('Response not of Content-Type text/plain');
    }
    this.responsePayload = this.response.text;
    if (typeof this.responsePayload !== 'string') {
      throw new Error('Response not a string');
    }
  }
});

Then(/contains a message property which says '(.+)'/, function (msg) {
  assert.equal(this.responsePayload.message, msg);
});

When(/^without a (?:'|")([\w-]+)(?:'|") header set$/, function (headerName) {
  this.request.unset(headerName);
});

When(/^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are)(\s+not)? a ([a-zA-Z]+)$/, function (payloadType, fields, invert, type) {
  const payload = getValidPayload(payloadType);
  const typeKey = type.toLowerCase();
  const valueKey = invert ? 'not' : 'is';
  const sampleValue = {
    string: {
      is: 'string',
      not: 10,
    },
  };
  const fieldsToModify = convertStringToArray(fields);
  fieldsToModify.forEach((field) => {
    payload[field] = sampleValue[typeKey][valueKey];
  });
  this.request
    .send(JSON.stringify(payload))
    .set('Content-Type', 'application/json');
});
When(/^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are) exactly (.+)$/, function (payloadType, fields, value) {
  this.payload = getValidPayload(payloadType);
  const fieldsToModify = convertStringToArray(fields);
  fieldsToModify.forEach((field) => {
    this.payload[field] = value;
  });
  this.request
    .send(JSON.stringify(this.payload))
    .set('Content-Type', 'application/json');
});
When(/attaches a valid (.+) payload/, function (payloadType) {
  this.payload = getValidPayload(payloadType);
  this.request
    .send(JSON.stringify(this.payload))
    .set('Content-Type', 'application/json');
});
Then(/^the payload object should be added to the database, grouped under the "([a-zA-Z]+)" type$/, function (type, callback) {
  this.type = type;
  client.get({
    index: process.env.ELASTICSEARCH_INDEX,
    type,
    id: this.responsePayload,
  })
    .then((result) => {
      assert.deepEqual(result._source, this.payload);
      callback();
    })
    .catch(callback);
});
Then(/^the newly\-created user should be deleted$/, function (callback) {
  client.delete({
    index: process.env.ELASTICSEARCH_INDEX,
    type: this.type,
    id: this.responsePayload,
  }).then((res) => {
    assert.equal(res._id, this.responsePayload);
    callback();
  }).catch(callback);
});
