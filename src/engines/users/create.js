import { validate } from '../../validators/users/create';
import ValidationError from '../../validators/errors/validationn-error';

export function create(req, db) {
  const validationResults = validate(req);
  if (validationResults instanceof ValidationError) {
    return Promise.reject(validationResults);
  }
  return db.index({
    index: process.env.ELASTICSEARCH_INDEX,
    type: 'user',
    body: req.body,
  });
}
