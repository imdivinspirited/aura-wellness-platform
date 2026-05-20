/**
 * Maps DB / Mongo driver failures to 503 + JSON so clients show a clear message instead of a generic 500.
 */

/**
 * @param {import('express').Response} res
 * @param {unknown} err
 * @returns {boolean} true if a response was sent
 */
export function respondIfMongoOrDbUnavailable(res, err) {
  if (!err || typeof err !== 'object') return false;

  const code = /** @type {{ code?: string }} */ (err).code;
  const name = /** @type {{ name?: string }} */ (err).name || '';
  const msg = String(/** @type {{ message?: string }} */ (err).message || '');

  if (code === 'MONGO_UNAVAILABLE') {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message:
          'Database unavailable. Check MONGODB_URI in backend/.env and ensure MongoDB is running and reachable.',
      },
    });
    return true;
  }
  if (code === 'DATABASE_NOT_CONFIGURED') {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message:
          'Database unavailable. Set MONGODB_URI in backend/.env. Postgres-style DATABASE_URL is ignored unless it starts with "mongodb".',
      },
    });
    return true;
  }

  const driverTransient =
    name === 'MongoNetworkError' ||
    name === 'MongoServerSelectionError' ||
    name === 'MongoExpiredSessionError' ||
    name === 'PoolClearedError' ||
    name === 'MongoNotConnectedError' ||
    (msg.toLowerCase().includes('topology') && msg.toLowerCase().includes('closed')) ||
    msg.includes('not connected');

  if (driverTransient) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message:
          'Lost connection to MongoDB. Ensure MongoDB is running (`npm run docker:db` from the repo root) and restart the API.',
      },
    });
    return true;
  }

  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message:
          'Cannot reach MongoDB (network). Check MONGODB_URI and that the host is up (local: start Docker Mongo).',
      },
    });
    return true;
  }

  return false;
}
