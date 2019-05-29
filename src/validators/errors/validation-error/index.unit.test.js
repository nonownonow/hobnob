import assert from 'assert';
import { ValidationError } from './index';

describe('ValidationError', function () {
  it('should be a subclass of Error', function () {
    const validationError = new ValidationError();
    assert.strictEqual(validationError instanceof Error, true);
  });
  describe('constructor', function () {
    it('should make the constructor parameter accessible via the "message" property of the instance', function () {
      const message = 'message';
      const validationError = new ValidationError(message);
      assert.strictEqual(validationError.message, message);
    });
  });
});
