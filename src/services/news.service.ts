import type { IPayloadCreateNews, IPayloadGetListNews } from '@/controllers/filters/news.filter';
import { ValidatorInput } from '@/core/helpers/class-validator.helper';
import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import type { IResponseServer } from '@/core/interfaces/common.interface';
import { NewsModel } from '@/database/entities/news.entity';

import { NewsRepository } from '@/repositories/news.repostiory';
import { Prisma } from '@prisma/client';
import moment from 'moment-timezone';
import { v4 as uuidV4 } from 'uuid';

export class NewsService {
    private newsRepository = new NewsRepository();
    private validateInputService = new ValidatorInput();
    constructor() {}

    public async getList(payload: IPayloadGetListNews): Promise<IResponseServer> {
        try {
            const { page = 1, limit = 10, keyword } = payload;
            const skip = (page - 1) * limit;
            const where: Prisma.NewsWhereInput = {};
            if (keyword) {
                where.OR = [{ title: { contains: keyword } }, { contents: { contains: keyword } }, { description: { contains: keyword } }];
            }
            const paging = {
                skip,
                limit,
                page,
            };
            const { items, totalItems } = await this.newsRepository.getList(where, paging);
            const totalPages = Math.ceil(totalItems / limit);

            return new ResponseHandler(200, true, 'Get List curriculum successfully', {
                items,
                totalItems,
                totalPages,
                page,
                limit,
            });
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async getById(id: string): Promise<IResponseServer> {
        try {
            const newsRecords = await this.newsRepository.getById(id);
            if (!newsRecords) return new ResponseHandler(404, false, 'Faculty not found', null);
            return new ResponseHandler(200, true, 'Get info news successfully', newsRecords);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async create(payload: IPayloadCreateNews): Promise<IResponseServer> {
        try {
            const id = uuidV4();
            const newRecord = new NewsModel({
                id,
                contents: payload.contents,
                title: payload.title.trim(),
                description: payload.description?.trim(),
            });
            const validation = await this.validateInputService.validate(newRecord);
            if (validation) return validation;
            const newRecordCreated = await this.newsRepository.create(newRecord);
            if (!newRecordCreated) return new ResponseHandler(500, false, 'Can not create new news', null);
            return new ResponseHandler(201, true, 'Create new news successfully', newRecordCreated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async update(payload: IPayloadCreateNews): Promise<IResponseServer> {
        try {
            const newsRecord = await this.newsRepository.getById(payload.id);
            if (!newsRecord) {
                return new ResponseHandler(404, true, `News with id ${payload.id} not found`, newsRecord);
            }
            const newRecord = new NewsModel({
                id: payload.id,
                contents: payload.contents,
                title: payload.title.trim(),
                description: payload.description?.trim(),
                updatedAt: moment().format(),
            });
            const validation = await this.validateInputService.validate(newRecord);
            if (validation) return validation;
            const newRecordCreated = await this.newsRepository.updateRecord({
                updateCondition: { id: newRecord.id },
                updateQuery: {
                    contents: newRecord.contents,
                    title: newRecord.title,
                    description: newRecord.description,
                    updatedAt: newRecord.updatedAt,
                },
            });
            if (!newRecordCreated) return new ResponseHandler(500, false, 'Can not update news', null);
            return new ResponseHandler(200, true, 'Update the news successfully', newRecordCreated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async permanentlyDelete(id: string): Promise<IResponseServer> {
        try {
            const facultyRecord = await this.newsRepository.permanentlyDelete(id);
            if (!facultyRecord) {
                return new ResponseHandler(404, false, `News not found with id: ${id}`, null);
            }
            return new ResponseHandler(200, true, 'Deleted news successfully', facultyRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }
}
