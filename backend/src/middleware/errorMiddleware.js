export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route nuk u gjet: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: err.message || "Gabim ne server" });
}
