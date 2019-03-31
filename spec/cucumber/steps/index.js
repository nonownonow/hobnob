import { When, Then } from 'cucumber';
import superagent from 'superagent'
When('the client creates a POST request to /users', function (callback) {
  request = superagent('POST', 'localhost:8080/users')
});

When('attaches a generic empty payload', function (callback) {
  callback(null, 'pending');
});

When('sends the request', function (callback) {
  callback(null, 'pending');
});

Then('our API should respond with a 400 HTTP status code', function (callback) {
  callback(null, 'pending');
});

Then('the payload of the response should be a JSON object', function (callback) {
  callback(null, 'pending');
});

Then('contains a message property which says "Payload should not be empty"', function (callback) {
  callback(null, 'pending');
});
