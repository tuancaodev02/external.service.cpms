import ScriptController from '@/controllers/script.controller';
import { Authentication } from '@/core/middlewares/auth.middleware';
import { Router } from 'express';

const router: Router = Router();
const scriptController = new ScriptController();

router.post('/execute', Authentication.admin, scriptController.execute.bind(scriptController));

export default router;
