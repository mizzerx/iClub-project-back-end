import { Router } from 'express';
import clubsController from '../controllers/clubsController';

const clubsRouter = Router();

clubsRouter.route('/').get(clubsController.getClubs);

clubsRouter
  .route('/club')
  .get(clubsController.getClub)
  .post(clubsController.createClub);

clubsRouter.route('/club/:id').put(clubsController.updateClub);

clubsRouter.route('/club/join').post(clubsController.joinClub);
clubsRouter.route('/club/:id/comment').post(clubsController.addComment);
clubsRouter.route('/club/:id/leave').delete(clubsController.leaveClub);
clubsRouter.route('/club/:id').delete(clubsController.deleteClub);
clubsRouter
  .route('/club/:id/member/:memberId')
  .delete(clubsController.removeMember);

export default clubsRouter;
