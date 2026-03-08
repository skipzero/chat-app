import { Router } from 'express';


export const apiRouter = Router();

apiRouter.use('/me', userRouter)
