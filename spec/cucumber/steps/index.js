import superagent from 'superagent';
import { When, Then } from 'cucumber';
import assert from 'assert';

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

When('sends the request', function (callback) {
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

Then('our API should respond with a {int} HTTP status code', function (statusCode) {
  assert.equal(this.response.statusCode, statusCode);
});

Then('the payload of the response should be a JSON object', function () {
  // Check Content-Type header
  const contentType = this.response.headers['Content-Type'] || this.response.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response not of Content-Type application/json');
  }
  try {
    this.responsePayload = JSON.parse(this.response.text);
  } catch (err) {
    throw new Error('Response not a valid JSON object');
  }
});

Then(/contains a message property which says '(.+)'/, function (msg) {
  assert.equal(this.responsePayload.message, msg);
});

When(/^without a (?:'|")([\w-]+)(?:'|") header set$/, function (headerName) {
  this.request.unset(headerName);
});

When(/^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are)(\s+not)? a ([a-zA-Z]+)$/, function (payloadType, fields, invert, type) {
  const payload = {
    email: 'em@il.y',
    password: 'passworld',
  };
  const typeKey = type.toLowerCase();
  const valueKey = invert ? 'not' : 'is';
  const sampleValue = {
    string: {
      is: 'string',
      not: 10,
    },
  };
  fields.split(',').map(field => field.trim()).filter(s => s !== '').forEach((field) => {
    payload[field] = sampleValue[typeKey][valueKey];
  });
  this.request
    .send(JSON.stringify(payload))
    .set('Content-Type', 'application/json');
});
When(/^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are) exactly (.+)$/, function (payloadType, fields, value) {
  const payload = {
    email: 'e@ma.il',
    password: 'password',
  };
  const fieldsToModify = fields.split(',').map(s => s.trim()).filter(s => s !== '');
  fieldsToModify.forEach((field) => {
    payload[field] = value;
  });
  this.request
    .send(JSON.stringify(payload))
    .set('Content-Type', 'application/json');
});
