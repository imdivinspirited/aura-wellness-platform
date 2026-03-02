/**
 * API Router
 *
 * Main API router that combines all route modules.
 */

import { Router } from 'express';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { cartsRouter } from './carts';
import { notificationsRouter } from './notifications';
import { programsRouter } from './programs';
import { servicesRouter } from './services';
import { eventsRouter } from './events';
import { rootRouter } from './root';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Route modules
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/carts', cartsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/programs', programsRouter);
apiRouter.use('/services', servicesRouter);
apiRouter.use('/events', eventsRouter);
apiRouter.use('/root', rootRouter);
