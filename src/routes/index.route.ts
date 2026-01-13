import ExceptionController from '@/controllers/exception.controller';
import { Router } from 'express';
import admissionsRouter from './admissions.route';
import authRouter from './auth.route';
import courseRequirement from './course-requirement.route';
import courseRouter from './course.route';
import curriculumRouter from './curriculum.route';
import facultyRouter from './faculty.route';
import newsRouter from './news.route';
import roleRouter from './role.route';
import schoolRouter from './school.route';
import userRouter from './user.route';
const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/role', roleRouter);
rootRouter.use('/school', schoolRouter);
rootRouter.use('/curriculum', curriculumRouter);
rootRouter.use('/faculty', facultyRouter);
rootRouter.use('/course', courseRouter);
rootRouter.use('/course-requirement', courseRequirement);
rootRouter.use('/user', userRouter);
rootRouter.use('/news', newsRouter);
rootRouter.use('/admissions', admissionsRouter);
rootRouter.use(
    '*',
    (req, res, next) => {
        console.log('req', req);
        console.log(`Request received: ${req.method} - ${req.url}`);
        next();
    },
    new ExceptionController().endpointException,
);

export default rootRouter;
