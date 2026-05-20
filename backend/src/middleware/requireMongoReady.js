import { isMongoReady } from '../db.js';

/**
 * Ensures MongoDB is connected before running handlers that need persistence.
 */
export function requireMongoReady(req, res, next) {
  if (!isMongoReady()) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'MONGO_UNAVAILABLE',
        message:
          'Database is not connected. Set MONGODB_URI in backend/.env, ensure the cluster is reachable, and restart the API.',
      },
    });
  }
  return next();
}
