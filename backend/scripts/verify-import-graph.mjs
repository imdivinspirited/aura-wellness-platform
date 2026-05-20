#!/usr/bin/env node
/**
 * Loads the full Express app + API route graph without listening on a port.
 * Catches ReferenceError / missing imports before `node src/server.js` runs.
 */
import '../src/bootstrap.js';
import { setupExpressApp, mountApiV1Routes } from '../src/app.js';

const app = setupExpressApp();
mountApiV1Routes(app);
console.log('[verify:imports] Express route graph loaded OK');
