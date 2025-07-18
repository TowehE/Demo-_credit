
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const authController = new AuthController();

const loginSchema = Joi.object({
    email: Joi.string().email().required()
});

router.post('/login', validateRequest(loginSchema), authController.login);

export default router;










