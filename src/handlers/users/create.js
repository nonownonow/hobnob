
export function createUser(req, res, db) {
  const requiredField = ['email', 'password'];
  if (!requiredField.every(field => Object.hasOwnProperty.call(req.body, field))) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'Payload must contain at least the email and password fields',
    });
  }
  if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The email and password fields must be of type string',
    });
  }
  if (!/^[\w.+]+@\w+\.\w+$/.test(req.body.email)) {
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
      message: 'The email field must be a valid email',
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
