import { validate } from '../../validators/users/create';
import ValidationError from '../../validators/errors/validationn-error';

export function createUser(req, res, db) {
  const validationResults = validate(req);
  if (validationResults instanceof ValidationError) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: validationResults.message,
    });
  }
  res.status(201);
  db.index({
    index: process.env.ELASTICSEARCH_INDEX,
    type: 'user',
    body: req.body,
  })
    .then((result) => {
      res.set('Content-Type', 'text/plain');
      res.send(result._id);
      return result;
    })
    .catch(() => {
      res.status(500);
      res.set('Content-Type', 'application/json');
      res.json({ message: 'Internal Server Error' });
    });
}
