import { Router } from 'express';
import userRouter from './routers/user.routes';
import threadsRouter from './routers/threads.routes';
import uploadRouter from './routers/upload.routes';

export const apiRouter: Router = Router();

apiRouter.use('/profile', userRouter);
apiRouter.use('/threads', threadsRouter);
apiRouter.use('/upload', uploadRouter);