import router from 'express';
import { z } from 'zod';
import { Router } from 'express';

const chatRouter: Router = router.Router();

const ChatSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  avatar: z.url().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export default chatRouter;