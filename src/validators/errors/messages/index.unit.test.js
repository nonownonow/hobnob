import assert from 'assert';
import { generateValidationErrorMessage } from './index';

describe('generateValidationErrorMessage', function () {
  it('should return the correct string when error.keyword is "required"', function () {
    const errors = [{
      keyword: 'required',
      dataPath: '.test.path',
      params: {
        missingProperty: 'property',
      },
    }];
    const actualErrorMessage = generateValidationErrorMessage(errors);
    const expectedErrorMessage = "The '.test.path.property' field is missing";
    assert.strictEqual(actualErrorMessage, expectedErrorMessage);
  });
  it('should return the correct string when err.keyword is "type"', function () {
    const errors = [{
      keyword: 'type',
      dataPath: '.test.path',
      params: {
        type: 'string',
      },
    }];
    const actualErrorMessage = generateValidationErrorMessage(errors);
    const expectedErrorMessage = "The '.test.path' field must be of type string";
    assert.strictEqual(actualErrorMessage, expectedErrorMessage);
  });
  it('should return the correct string when err.keyword is "format"', function () {
    const errors = [{
      keyword: 'format',
      dataPath: '.test.path',
      params: {
        format: 'path',
      },
    }];
    const actualErrorMessage = generateValidationErrorMessage(errors);
    const expectedErrorMessage = "The '.test.path' field must be a valid path";
    assert.strictEqual(actualErrorMessage, expectedErrorMessage);
  });
  it('should return the correct string when err.keyword is "additionalProperties"', function () {
    const errors = [{
      keyword: 'additionalProperties',
      dataPath: '.test.path',
      params: {
        additionalProperty: 'path',
      },
    }];
    const actualErrorMessage = generateValidationErrorMessage(errors);
    const expectedErrorMessage = "The '.test.path' object dose not support the field 'path'";
    assert.strictEqual(actualErrorMessage, expectedErrorMessage);
  });
  it('should return the correct string when err.keyword is not recognized', function () {
    const errors = [{}];
    const actualErrorMessage = generateValidationErrorMessage(errors);
    const expectedErrorMessage = "The object is invalid";
    assert.strictEqual(actualErrorMessage, expectedErrorMessage);
  });
});
