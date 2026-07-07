/**
 * Barrel export — App Router principal.
 */

import { router } from '../_core/trpc';
import { telegramRouter } from './telegram.router';
import { userRouter } from './user.router';
import { postRouter } from './post.router';
import { followRouter } from './follow.router';
import { reactionRouter } from './reaction.router';
import { adminRouter } from './admin.router';
import { systemRouter } from '../_core/systemRouter';

export const appRouter = router({
  system:    systemRouter,
  telegram:  telegramRouter,
  users:     userRouter,
  posts:     postRouter,
  follows:   followRouter,
  reactions: reactionRouter,
  admin:     adminRouter,
});

export type AppRouter = typeof appRouter;
