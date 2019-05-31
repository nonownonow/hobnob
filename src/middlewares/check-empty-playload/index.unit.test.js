import assert from 'assert';
import clonedeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { spy } from 'sinon';
import { checkEmptyPayload } from './index';

describe('checkEmptyPlayload', function () {
  let req;
  let res;
  let next;
  let cloneRes;

  describe(`When req.method is not one of POST, PATCH or PUT`, function () {
    beforeEach(function () {
      req = {
        method: 'GET',
      };
      res = {};
      next = spy();
      cloneRes = clonedeep(res);
      checkEmptyPayload(req, res, next);
    });
    it('should not modify res', function () {
      assert(isEqual(res, cloneRes));
    });
    it('should call next() once', function () {
      assert(next.calledOnce);
    });
  });
  ['POST', 'PATCH', 'PUT'].forEach(function (method) {
    describe(`When req.method is ${method}`, function () {
      describe('and the content-length header is not "0"', function () {
        beforeEach(function () {
          req = {
            method,
            headers: {
              "content-length": '1',
            },
          };
          res = {};
          next = spy();
          cloneRes = clonedeep(res);
          checkEmptyPayload(req, res, next);
        });
        it('should not modify res', function () {
          assert(isEqual(res, cloneRes));
        });
        it('should call next() once', function () {
          assert(next.calledOnce);
        });
      });
      describe('and the content-length header is "0"', function () {
        beforeEach(function () {
          req = {
            method,
            headers: {
              "content-length": '0',
            },
          };
          res = {
            status: spy(),
            set: spy(),
            json: spy(),
          };
          next = spy();
          cloneRes = clonedeep(res);
          checkEmptyPayload(req, res, next);
        });
        describe('should call res.status()', function () {
          it('once', function () {
            res.status.calledOnce;
          });
          it('with the argument 400', function () {
            res.status.calledWithExactly(400);
          });
        });
        describe('should call res.set()', function () {
          it('once', function () {
            res.set.calledOnce;
          });
          it('with the arguments "Content-Type" and "application/json"', function () {
            res.status.calledWithExactly('Content-Type', 'application/json');
          });
        });
        describe('should call res.json()', function () {
          it('once', function () {
            res.json.calledOnce;
          });
          it('with the correct error object', function () {
            res.status.calledWithExactly({
              message: 'Payload should not be empty',
            });
          });
          it('should not call next()', function () {
            next.notCalled;
          });
        });
      });
    });
  });
});
