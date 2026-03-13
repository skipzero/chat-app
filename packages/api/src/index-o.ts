import { Router } from 'express';
import userRouter from './routers/user.routes';
import threadsRouter from './routers/threads.routes';
import notificationsRouter from './routers/notifications.routes';
import chatRouter from './routers/chat.routes';
import uploadRouter from './routers/upload.routes';

export const apiRouter: Router = Router();

apiRouter.use('/profile', userRouter);
apiRouter.use('threads', threadsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/upload', uploadRouter);