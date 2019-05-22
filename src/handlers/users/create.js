
export function createUser(req, res, db) {
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
