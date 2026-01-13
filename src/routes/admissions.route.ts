import AdmissionsController from '@/controllers/admissions.controller';
import { Authentication } from '@/core/middlewares/auth.middleware';
import { Router } from 'express';

const router: Router = Router();
const admissionsController = new AdmissionsController();
router.route('/upgrade-to-student').post(Authentication.admin, admissionsController.upgradeToStudent.bind(admissionsController));
router
    .route('/:id')
    .get(Authentication.admin, admissionsController.getById.bind(admissionsController))
    .delete(Authentication.admin, admissionsController.permanentlyDelete.bind(admissionsController));
router
    .route('/')
    .get(Authentication.admin, admissionsController.getList.bind(admissionsController))
    .post(admissionsController.create.bind(admissionsController));

export default router;
