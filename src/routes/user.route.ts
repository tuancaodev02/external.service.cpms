import UserController from '@/controllers/user.controller';
import { Authentication } from '@/core/middlewares/auth.middleware';
import { Router } from 'express';

const router: Router = Router();
const userController = new UserController();
router.route('/register-course').post(Authentication.user, userController.registerCourse.bind(userController));
router.route('/accept-register-course').post(Authentication.admin, userController.acceptRegisterCourse.bind(userController));
router.route('/completer-course').post(Authentication.admin, userController.completeCourse.bind(userController));
router
    .route('/:id')
    .get(Authentication.user, userController.getById.bind(userController))
    .put(Authentication.user, userController.update.bind(userController))
    .delete(Authentication.user, userController.permanentlyDelete.bind(userController));
router.route('/').get(userController.getList.bind(userController));

export default router;
