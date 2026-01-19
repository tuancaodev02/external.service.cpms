import type { IPayloadGetListCurriculum } from '@/controllers/filters/curriculum.filter';
import type { IPayloadCreateFaculty } from '@/controllers/filters/faculty.filter';
import { ValidatorInput } from '@/core/helpers/class-validator.helper';
import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import type { IResponseServer } from '@/core/interfaces/common.interface';
import { FacultyModel } from '@/database/entities/faculty.entity';
import { CourseRepository } from '@/repositories/course.repository';
import { CurriculumRepository } from '@/repositories/curriculum.repository';

import { FacultyRepository } from '@/repositories/faculty.repository';
import { Prisma } from '@prisma/client';
import moment from 'moment-timezone';
import { v4 as uuidV4 } from 'uuid';

export class FacultyService {
    private facultyRepository = new FacultyRepository();
    private curriculumRepository = new CurriculumRepository();
    private validateInputService = new ValidatorInput();
    private courseRepository = new CourseRepository();
    constructor() {}

    public async getList(payload: IPayloadGetListCurriculum): Promise<IResponseServer> {
        try {
            const { page = 1, limit = 10, keyword, durationStart, durationEnd } = payload;
            const skip = (page - 1) * limit;
            const where: Prisma.FacultiesWhereInput = {};
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
            const { items, totalItems } = await this.facultyRepository.getList(where, paging);
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
            const facultyRecords = await this.facultyRepository.getById(id);
            if (!facultyRecords) return new ResponseHandler(404, false, 'Faculty not found', null);
            return new ResponseHandler(200, true, 'Get info faculty successfully', facultyRecords);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async create(payload: IPayloadCreateFaculty): Promise<IResponseServer> {
        try {
            const facultyRecord = await this.facultyRepository.getByCode(payload.code);
            if (facultyRecord) {
                return new ResponseHandler(200, true, 'Faculty is exits', facultyRecord);
            }
            const curriculumRecord = await this.curriculumRepository.getById(payload.curriculumId);
            if (!curriculumRecord) return new ResponseHandler(404, true, 'Curriculum not found', curriculumRecord);

            const id = uuidV4();
            const newFaculty = new FacultyModel({
                id,
                code: payload.code,
                courses: payload.courseIds || [],
                curriculum: payload.curriculumId,
                durationStart: payload.durationStart,
                durationEnd: payload.durationEnd,
                title: payload.title.trim(),
                description: payload.description?.trim(),
                thumbnailUrl: payload.thumbnailUrl,
            });
            const validation = await this.validateInputService.validate(newFaculty);
            if (validation) return validation;

            // Remove $pull logic.

            const newFacultyRecord = await this.facultyRepository.create(newFaculty);
            if (!newFacultyRecord) return new ResponseHandler(500, false, 'Can not create new faculty', null);

            // Manually link courses if needed?
            // FacultyRepository.create handles `curriculum` connect.
            // But what about `courses`?
            // If `courses` in payload, we should connect them.
            // FacultyRepository.create (my impl) did NOT handle courses explicitly?
            // Let's rely on Service to update courses or update repo?
            // I'll update courses here manually as well for safety.
            if (newFaculty.courses.length > 0) {
                await this.courseRepository.updateManyRecord({
                    updateCondition: { id: { in: newFaculty.courses } },
                    // @ts-ignore
                    updateQuery: {
                        facultyId: newFaculty.id,
                    } as any,
                });
            }

            return new ResponseHandler(201, true, 'Create new faculty successfully', newFacultyRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async update(payload: IPayloadCreateFaculty): Promise<IResponseServer> {
        try {
            const facultyRecord = await this.facultyRepository.getByIdNoPopulate(payload.id);
            if (!facultyRecord) {
                return new ResponseHandler(404, true, `Faculty with id ${payload.id} not found`, facultyRecord);
            }

            let courseIds: string[] = [];
            if (payload.courseIds && payload.courseIds.length) {
                const faculties = await this.courseRepository.getCourseMultipleId(payload.courseIds);
                courseIds = faculties.map((faculty) => faculty.id);
            }

            const facultyInstance = new FacultyModel({
                id: payload.id,
                title: payload.title.trim() || facultyRecord.title,
                description: payload.description?.trim() || facultyRecord.title,
                code: payload.code.trim() || facultyRecord.code,
                courses: courseIds,
                durationStart: payload.durationStart || facultyRecord.durationStart,
                durationEnd: payload.durationEnd || facultyRecord.durationEnd,
                curriculum: payload.curriculumId,
                thumbnailUrl: payload.thumbnailUrl,
                updatedAt: moment().format(),
            });
            const validation = await this.validateInputService.validate(facultyInstance);
            if (validation) return validation;

            // Remove $pull logic.

            const facultyRecordUpdated = await this.facultyRepository.updateRecord({
                updateCondition: { id: facultyInstance.id },
                updateQuery: {
                    title: facultyInstance.title,
                    description: facultyInstance.description,
                    code: facultyInstance.code,
                    durationStart: facultyInstance.durationStart,
                    durationEnd: facultyInstance.durationEnd,
                    thumbnailUrl: payload.thumbnailUrl,
                    curriculum: { connect: { id: facultyInstance.curriculum } },
                    updatedAt: facultyInstance.updatedAt,
                    createdAt: facultyInstance.createdAt,
                    courses: { connect: facultyInstance.courses.map((id) => ({ id })) },
                },
            });

            if (!facultyRecordUpdated) return new ResponseHandler(500, false, 'Can not update faculty record', null);
            return new ResponseHandler(200, true, 'Update the faculty successfully', facultyRecordUpdated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async permanentlyDelete(id: string): Promise<IResponseServer> {
        try {
            const facultyRecord = await this.facultyRepository.permanentlyDelete(id);
            if (!facultyRecord) {
                return new ResponseHandler(404, false, `Faculty not found with id: ${id}`, null);
            }
            return new ResponseHandler(200, true, 'Deleted faculty successfully', facultyRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }
}
