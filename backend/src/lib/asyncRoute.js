/**
 * Express 4 does not catch async handler rejections — they become unhandledRejection and
 * the client may see an empty 502/500 from the proxy. Use this wrapper so failures hit next(err).
 *
 * @param {(req: import('express').Request, res: import('express').Response) => Promise<unknown>} fn
 */
export function asyncRoute(fn) {
  return function asyncRouteWrapped(req, res, next) {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (e) {
      next(e);
    }
  };
}
