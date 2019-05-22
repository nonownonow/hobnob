import { validate } from '../../validators/users/create';
import ValidationError from '../../validators/errors/validationn-error';
import { create } from '../../engines/users/create';

export function createUser(req, res, db) {
  create(req, db).then((result) => {
    res.status(201);
    res.set('Content-Type', 'text/plain');
    res.send(result._id);
    return result;
  })
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(400);
        res.set('Content-Type', 'application/json');
        res.json({
          message: err.message,
        });
      }
      res.status(500);
      res.set('Content-Type', 'application/json');
      res.json({ message: 'Internal Server Error' });
    });
}
