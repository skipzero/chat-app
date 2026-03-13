import router from 'express';
import { z } from 'zod';
// import { Router } from 'express';

const threadsRouter: Router = router.Router();

const ThreadsSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  avatar: z.url().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export default threadsRouter;