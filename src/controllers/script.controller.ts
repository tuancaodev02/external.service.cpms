import { ScriptExecuteFilterModel } from '@/controllers/filters/script.filter';
import { Required } from '@/core/decorators/validate.decorator';
import { ScriptService } from '@/services/script.service';
import type { Request, Response } from 'express';

export default class ScriptController {
    private scriptService = new ScriptService();
    constructor() {}

    @Required(ScriptExecuteFilterModel)
    public async execute(req: Request, res: Response): Promise<Response> {
        const result = await this.scriptService.execute(req.body);
        return res.status(result.status).json(result);
    }
}
