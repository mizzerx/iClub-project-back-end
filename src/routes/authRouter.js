import { Router } from 'express';
import authController from '../controllers/authController';

const authRouter = Router();

authRouter.route('/login').post(authController.login);

export default authRouter;
