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
