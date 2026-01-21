import { EModePayload, Required } from '@/core/decorators/validate.decorator';
import type { RequestAuthorized } from '@/core/interfaces/common.interface';
import { UserService } from '@/services/user.service';
import type { Request, Response } from 'express';
import {
    GetInfoUserFilterModel,
    GetPagingUserFilterModel,
    UpdateUserFilterModel,
    UserAcceptCourseRegisterFilterModel,
    UserCourseRegisterFilterModel,
    type IPayloadGetListUser,
} from './filters/user.filter';

export default class UserController {
    private userService = new UserService();
    constructor() {}

    @Required(GetPagingUserFilterModel, EModePayload.QUERY)
    public async getList(req: Request, res: Response): Promise<Response> {
        const query = (req.query as Partial<IPayloadGetListUser>) || {};
        const payload: IPayloadGetListUser = {
            ...query,
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
        };
        const result = await this.userService.getList(payload);
        return res.status(result.status).json(result);
    }

    @Required(GetInfoUserFilterModel, EModePayload.PARAMS)
    public async getById(req: Request, res: Response): Promise<Response> {
        const result = await this.userService.getById(req.params.id);
        return res.status(result.status).json(result);
    }

    @Required(UserCourseRegisterFilterModel)
    public async registerCourse(req: RequestAuthorized, res: Response): Promise<Response> {
        const result = await this.userService.registerCourse(Object.assign(req.body));
        return res.status(result.status).json(result);
    }

    @Required(UserAcceptCourseRegisterFilterModel)
    public async acceptRegisterCourse(req: RequestAuthorized, res: Response): Promise<Response> {
        const result = await this.userService.acceptRegisterCourse(Object.assign(req.body));
        return res.status(result.status).json(result);
    }

    @Required(UserCourseRegisterFilterModel)
    public async completeCourse(req: RequestAuthorized, res: Response): Promise<Response> {
        const result = await this.userService.completeCourse(Object.assign(req.body));
        return res.status(result.status).json(result);
    }

    @Required(GetInfoUserFilterModel, EModePayload.PARAMS)
    @Required(UpdateUserFilterModel)
    public async update(req: RequestAuthorized, res: Response): Promise<Response> {
        const payload = Object.assign(req.body, req.params);
        const result = await this.userService.update(payload, req.user?.roles || []);
        return res.status(result.status).json(result);
    }

    @Required(GetInfoUserFilterModel, EModePayload.PARAMS)
    public async permanentlyDelete(req: Request, res: Response): Promise<Response> {
        const result = await this.userService.permanentlyDelete(req.params.id);
        return res.status(result.status).json(result);
    }
}
