/**
 * Root sessions are validated with signed JWTs (`lib/rootJwt.js`), not a separate collection.
 * This module documents the logical session shape and can be extended for server-side revocation lists.
 *
 * @typedef {Object} RootSessionLogical
 * @property {string} subjectId — root_accounts.id or users.id (role root)
 * @property {string} jti — JWT id (future: denylist in `root_access_revocations`)
 */

export const ROOT_SESSION_KIND = 'root_access';
