import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createUserSchema } from '../utils/validation';

const router = Router();
const userController = new UserController();

router.post('/register', validateRequest(createUserSchema), userController.register);
router.get('/profile', authenticate, userController.getProfile);

export default router;
