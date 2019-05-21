export function injectHandlerDependencies(handlers, db) {
  return (req, res) => handlers(req, res, db);
}
