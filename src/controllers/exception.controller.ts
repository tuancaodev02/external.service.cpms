import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import type { Request, Response } from 'express';

export default class ExceptionController {
    constructor() {}
    public endpointException = async (req: Request, res: Response): Promise<Response> => {
        const responseError = new ResponseHandler(404, false, 'Endpoint not found', null);
        return res.status(responseError.status).json(responseError);
    };
}
