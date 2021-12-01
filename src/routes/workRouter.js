import { Router } from 'express';
import {
  createWork,
  createWorkAnswer,
  getWork,
  getWorkAnswer,
  getWorkAnswerByUser,
  getWorks,
  updateWorkAnswer,
} from '../controllers/workController';

const workRouter = Router();

workRouter.route('/club/:clubId').get(getWorks).post(createWork);
workRouter.route('/:workId').get(getWork);
workRouter.route('/:workId/answer').post(createWorkAnswer).get(getWorkAnswer);
workRouter.route('/:workId/answer/:answerId').put(updateWorkAnswer);
workRouter.route('/:workId/answer/user/:userId').get(getWorkAnswerByUser);

export default workRouter;
