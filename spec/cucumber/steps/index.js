import superagent from 'superagent';
import { When, Then } from 'cucumber';
import assert from 'assert';

When('the client creates a POST request to /users', function () {
  this.request = superagent('POST', `${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}/users`);
});

When('attaches a generic empty payload', function () {
  return undefined;
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
Then('our API should respond with a 400 HTTP status code', function () {
  assert.equal(this.response.statusCode, 400);
});
Then('the payload of the response should be a JSON object', function () {
  // Check Content-Type header
  const contentType = this.response.headers['Content-Type'] || this.response.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response not of Content-Type application/json');
  }
  try {
    this.payload = JSON.parse(this.response.text);
  } catch (err) {
    throw new Error('Response not a valid JSON object');
  }
});

Then('contains a message property which says "Payload should not be empty"', function () {
  if (this.payload.message !== 'Payload should not be empty') {
    throw new Error();
  }
  assert.equal(this.payload.message, 'Payload should not be empty');
});
