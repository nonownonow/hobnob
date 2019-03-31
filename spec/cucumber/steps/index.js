import { When, Then } from 'cucumber';
import superagent from 'superagent';

let request;
let result;
let error;

When('the client creates a POST request to /users', () => {
  request = superagent('POST', 'localhost:8080/users');
});

When('attaches a generic empty payload', function () {
  return undefined;
});

When('sends the request', (callback) => {
  request
    .then((response) => {
      result = response.res;
      callback();
    })
    .catch((errResponse) => {
      error = errResponse.response;
      callback();
    });
});

Then('our API should respond with a 400 HTTP status code', (callback) => {
  if(error.statusCode !== 400){
    throw new Error()
  }
});

Then('the payload of the response should be a JSON object', (callback) => {
  callback(null, 'pending');
});

Then('contains a message property which says "Payload should not be empty"', (callback) => {
  callback(null, 'pending');
});
