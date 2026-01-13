import NewsController from '@/controllers/news.controller';
import { Authentication } from '@/core/middlewares/auth.middleware';
import { Router } from 'express';

const router: Router = Router();
const newsController = new NewsController();
router
    .route('/:id')
    .get(newsController.getById.bind(newsController))
    .put(Authentication.admin, newsController.update.bind(newsController))
    .delete(Authentication.admin, newsController.permanentlyDelete.bind(newsController));
router.route('/').get(newsController.getList.bind(newsController)).post(Authentication.admin, newsController.create.bind(newsController));

export default router;
