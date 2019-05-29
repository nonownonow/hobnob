import { validate } from '../../validators/users/create';
import Index from '../../validators/errors/validation-error';

export function create(req, db) {
  const validationResults = validate(req);
  if (validationResults instanceof Index) {
    return Promise.reject(validationResults);
  }
  return db.index({
    index: process.env.ELASTICSEARCH_INDEX,
    type: 'user',
    body: req.body,
  });
}
