import SchoolController from '@/controllers/school.controller';
import { Authentication } from '@/core/middlewares/auth.middleware';
import { Router } from 'express';

const router: Router = Router();
const schoolController = new SchoolController();
router.route('/:id').get(schoolController.getById.bind(schoolController)).put(schoolController.update.bind(schoolController));
router
    .route('/')
    .get(schoolController.getList.bind(schoolController))
    .post(Authentication.admin, schoolController.create.bind(schoolController));

export default router;
