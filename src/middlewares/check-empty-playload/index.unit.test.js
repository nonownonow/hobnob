import assert from 'assert';
import clonedeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { spy } from 'sinon';
import { checkEmptyPayload } from './index';

['POST', 'PATCH', 'PUT'].forEach(function (method) {
  describe('checkEmptyPlayload', function () {
    let req;
    let res;
    let next;
    let cloneRes;
    before(function () {
      req = {
        method: 'GET',
      };
      res = {};
      next = spy();
      cloneRes = clonedeep(res);
      checkEmptyPayload(req, res, next);
    });

    describe(`When req.method is not one of ${method}`, function () {
      it('should not modify res', function () {
        assert(isEqual(res, cloneRes));
      });
      it('should call next() once', function () {
        assert(next.calledOnce);
      });
    });
  });
});
