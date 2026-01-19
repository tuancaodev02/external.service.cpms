import type {
    IPayloadCreateCurriculum,
    IPayloadGetListCurriculum,
    IPayloadUpdateCurriculum,
} from '@/controllers/filters/curriculum.filter';
import { ValidatorInput } from '@/core/helpers/class-validator.helper';
import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import type { IResponseServer } from '@/core/interfaces/common.interface';
import { CurriculumModel } from '@/database/entities/curriculum.entity';
import { CurriculumRepository } from '@/repositories/curriculum.repository';
import { FacultyRepository } from '@/repositories/faculty.repository';
import { Prisma } from '@prisma/client';
import moment from 'moment-timezone';

import { v4 as uuidV4 } from 'uuid';

export class CurriculumService {
    private curriculumRepository = new CurriculumRepository();
    private facultyRepository = new FacultyRepository();
    private validateInputService = new ValidatorInput();
    constructor() {}

    public async getList(payload: IPayloadGetListCurriculum): Promise<IResponseServer> {
        try {
            const { page = 1, limit = 10, keyword, durationStart, durationEnd } = payload;
            const skip = (page - 1) * limit;
            const where: Prisma.CurriculaWhereInput = {};
            if (keyword) {
                where.OR = [{ title: { contains: keyword } }, { code: { contains: keyword } }, { description: { contains: keyword } }];
            }

            if (durationStart && durationEnd) {
                where.durationStart = { gte: durationStart };
                where.durationEnd = { lte: durationEnd };
            }
            const paging = {
                skip,
                limit,
                page,
            };
            const { items, totalItems } = await this.curriculumRepository.getList(where, paging);
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
            const curriculumRecord = await this.curriculumRepository.getById(id);
            if (!curriculumRecord) return new ResponseHandler(404, false, 'Curriculum not found', null);
            return new ResponseHandler(200, true, 'Get curriculum successfully', curriculumRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async create(payload: IPayloadCreateCurriculum): Promise<IResponseServer> {
        try {
            const curriculumRecord = await this.curriculumRepository.getByCode(payload.code);
            if (curriculumRecord) {
                return new ResponseHandler(200, true, 'Curriculum is exits', curriculumRecord);
            }
            let facultyIds: string[] = [];
            if (payload.facultyIds && payload.facultyIds.length) {
                const faculties = await this.facultyRepository.getFacultiesMultipleId(payload.facultyIds);
                facultyIds = faculties.map((faculty) => faculty.id);
            }
            const id = uuidV4();
            const newCurriculum = new CurriculumModel({
                id,
                title: payload.title.trim(),
                description: payload.description?.trim(),
                code: payload.code.trim(),
                faculties: facultyIds,
                durationStart: payload.durationStart,
                durationEnd: payload.durationEnd,
            });
            const validation = await this.validateInputService.validate(newCurriculum);
            if (validation) return validation;

            // Prisma connection handling automatically moves faculties to this curriculum.
            // No need to $pull.

            const newCurriculumRecord = await this.curriculumRepository.create(newCurriculum);
            if (!newCurriculumRecord) return new ResponseHandler(500, false, 'Can not create new curriculum', null);

            // Manually update faculties to link to this curriculum? created Curriculum but did I link faculties?
            // CurriculumRepository default create didn't include link logic.
            // Manually link.
            if (facultyIds.length > 0) {
                await this.facultyRepository.updateManyRecord({
                    updateCondition: { id: { in: facultyIds } },
                    // @ts-ignore
                    updateQuery: {
                        curriculumId: newCurriculum.id,
                    } as any,
                });
            }

            return new ResponseHandler(201, true, 'Create new curriculum successfully', newCurriculumRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async update(payload: IPayloadUpdateCurriculum): Promise<IResponseServer> {
        try {
            const curriculumRecord = await this.curriculumRepository.getByIdNoPopulate(payload.id);
            if (!curriculumRecord) {
                return new ResponseHandler(404, true, 'Curriculum not found', curriculumRecord);
            }

            let facultyIds: string[] = [];
            if (payload.facultyIds && payload.facultyIds.length) {
                const faculties = await this.facultyRepository.getFacultiesMultipleId(payload.facultyIds);
                facultyIds = faculties.map((faculty) => faculty.id);
            }

            const newCurriculum = new CurriculumModel({
                id: payload.id,
                title: payload.title.trim() || curriculumRecord.title,
                description: payload.description?.trim() || curriculumRecord.title,
                code: payload.code.trim() || curriculumRecord.code,
                faculties: facultyIds,
                durationStart: payload.durationStart || curriculumRecord.durationStart,
                durationEnd: payload.durationEnd || curriculumRecord.durationEnd,
                createdAt: curriculumRecord.createdAt,
                updatedAt: moment().format(),
            });
            const validation = await this.validateInputService.validate(newCurriculum);
            if (validation) return validation;

            // Remove $pull logic.

            const curriculumRecordUpdated = await this.curriculumRepository.updateRecord({
                updateCondition: { id: newCurriculum.id },
                updateQuery: {
                    title: newCurriculum.title,
                    description: newCurriculum.description,
                    code: newCurriculum.code,
                    durationStart: newCurriculum.durationStart,
                    durationEnd: newCurriculum.durationEnd,
                    updatedAt: newCurriculum.updatedAt,
                    createdAt: newCurriculum.createdAt,
                    // Relation update handled via updateMany below OR here if 1-n reverse supported?
                    // Faculty has curriculumId. Curriculum does not have array of faculties in DB.
                    // So we cannot update faculties here directly via `set` unless using nested update which is supported for 1-n?
                    // Prisma `update` on Curriculum allows `faculties: { connect: [...] }`? YES.
                    // So we CAN use `faculties: { connect: ... }`
                    faculties: { connect: newCurriculum.faculties.map((id) => ({ id })) },
                },
            });

            if (!curriculumRecordUpdated) return new ResponseHandler(500, false, 'Can not update curriculum', null);
            return new ResponseHandler(200, true, 'Update curriculum successfully', curriculumRecordUpdated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async permanentlyDelete(id: string): Promise<IResponseServer> {
        try {
            const curriculumRecord = await this.curriculumRepository.permanentlyDelete(id);
            if (!curriculumRecord) {
                return new ResponseHandler(404, false, `curriculum not found with id: ${id}`, null);
            }
            return new ResponseHandler(200, true, 'Deleted server successfully', curriculumRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }
}
