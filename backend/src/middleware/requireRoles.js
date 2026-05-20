const ADMIN_ROLES = new Set(['content_admin', 'admin', 'super_admin', 'root']);

/** Platform JWT with `role: 'root'` only (stricter than {@link requireAdmin}). */
export function requireRoot(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }
  if (req.user.role !== 'root') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Root access required.' },
    });
  }
  return next();
}

export function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }
  if (!ADMIN_ROLES.has(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required.' },
    });
  }
  return next();
}
