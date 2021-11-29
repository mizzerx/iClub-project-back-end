import { Router } from 'express';
import userController from '../controllers/usersController';

const userRouter = Router();

userRouter.route('/').get(userController.getUsers);

userRouter
  .route('/user')
  .get(userController.getUser)
  .post(userController.createUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

userRouter.route('/user/clubs').get(userController.getUserClubs);

export default userRouter;
