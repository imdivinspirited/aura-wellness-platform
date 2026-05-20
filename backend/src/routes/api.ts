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
import { adminRouter } from './admin';
import { contentRouter } from './content';
import { formsRouter } from './forms';
import { usersProfileRouter } from './usersProfile';
import { usersActivitiesRouter } from './usersActivities';
import { marketplaceRouter } from './marketplace';
import { chatbotRouter } from './chatbot';
import { internationalRouter } from './international';
import { moodRouter } from './mood';
import { oauthRouter } from './oauth';
import { oauthAppleRouter } from './oauthApple';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Route modules
apiRouter.use('/auth', authRouter);
apiRouter.use('/', oauthRouter);
apiRouter.use('/', oauthAppleRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/carts', cartsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/programs', programsRouter);
apiRouter.use('/services', servicesRouter);
apiRouter.use('/events', eventsRouter);
apiRouter.use('/root', rootRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/content', contentRouter);
apiRouter.use('/forms', formsRouter);
apiRouter.use('/users', usersProfileRouter);
apiRouter.use('/users', usersActivitiesRouter);
apiRouter.use('/marketplace', marketplaceRouter);
apiRouter.use('/', chatbotRouter);
apiRouter.use('/', internationalRouter);
apiRouter.use('/', moodRouter);
