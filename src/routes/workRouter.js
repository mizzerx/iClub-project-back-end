import { Router } from 'express';
import { createWork, getWork, getWorks } from '../controllers/workController';

const workRouter = Router();

workRouter.route('/club/:clubId').get(getWorks).post(createWork);
workRouter.route('/:workId').get(getWork);

export default workRouter;
