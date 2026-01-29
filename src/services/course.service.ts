import type { IPayloadCreateCourse, IPayloadGetListCourse, IPayloadUpdateCourse } from '@/controllers/filters/course.filter';
import { ValidatorInput } from '@/core/helpers/class-validator.helper';
import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import type { IResponseServer } from '@/core/interfaces/common.interface';
import { CourseModel } from '@/database/entities/course.entity';
import { CourseRequirementRepository } from '@/repositories/course-requirement.repository';
import { CourseRepository } from '@/repositories/course.repository';
import { FacultyRepository } from '@/repositories/faculty.repository';
import { Prisma } from '@prisma/client';
import moment from 'moment-timezone';
import { v4 as uuidV4 } from 'uuid';

export class CourseService {
    private facultyRepository = new FacultyRepository();
    private courseRequirementRepository = new CourseRequirementRepository();
    private validateInputService = new ValidatorInput();
    private courseRepository = new CourseRepository();
    constructor() {}

    public async getList(payload: IPayloadGetListCourse): Promise<IResponseServer> {
        try {
            const { page = 1, limit = 10, keyword, durationStart, durationEnd } = payload;
            const skip = (page - 1) * limit;
            const where: Prisma.CoursesWhereInput = {};

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
            const { items, totalItems } = await this.courseRepository.getList(where, paging);
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
            const courseRecord = await this.courseRepository.getById(id);
            if (!courseRecord) return new ResponseHandler(404, false, 'Course not found', null);
            return new ResponseHandler(200, true, 'Get info course successfully', courseRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async create(payload: IPayloadCreateCourse): Promise<IResponseServer> {
        try {
            const courseRecord = await this.courseRepository.getByCode(payload.code);
            if (courseRecord) {
                return new ResponseHandler(200, true, 'Course is exits', courseRecord);
            }
            const facultyRecord = await this.facultyRepository.getByIdNoPopulate(payload.facultyId);
            if (!facultyRecord) return new ResponseHandler(404, true, 'Faculty not found', facultyRecord);
            const id = uuidV4();
            const newCourse = new CourseModel({
                id,
                code: payload.code,
                faculty: payload.facultyId,
                quantity: payload.quantity,
                durationStart: moment(payload.durationStart).format(),
                durationEnd: moment(payload.durationEnd).format(),
                title: payload.title.trim(),
                description: payload.description?.trim(),
                requirements: payload.requirementIds || [],
            });
            const validation = await this.validateInputService.validate(newCourse);
            if (validation) return validation;

            // Requirements are not linked in create method of repository, so we link them manually here.
            const newCourseRecord = await this.courseRepository.create(newCourse);
            if (!newCourseRecord) return new ResponseHandler(500, false, 'Can not create new course', null);

            if (newCourse.requirements && newCourse.requirements.length > 0) {
                await this.courseRequirementRepository.updateManyRecord({
                    updateCondition: { id: { in: newCourse.requirements as string[] } },
                    updateQuery: {
                        courseId: newCourseRecord.id,
                    } as any,
                });
            }

            return new ResponseHandler(201, true, 'Create new course successfully', newCourseRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async update(payload: IPayloadUpdateCourse): Promise<IResponseServer> {
        try {
            const courseRecord = await this.courseRepository.getById(payload.id);
            if (!courseRecord) {
                return new ResponseHandler(404, true, `Course with id ${payload.id} not found`, null);
            }

            let requirementsIds: string[] = [];
            if (payload.requirementIds && payload.requirementIds.length) {
                const requirements = await this.courseRequirementRepository.getCourseMultipleId(payload.requirementIds);
                requirementsIds = requirements.map((requirement) => requirement.id);
            }
            // Requirements Logic:
            // The logic was: Filter requirements that are REMOVED (not in payload but in current).
            // Pull removed ones. Add (set) new ones.

            const courseInstance = new CourseModel({
                id: payload.id,
                title: payload.title.trim(),
                description: payload.description?.trim(),
                code: payload.code.trim(),
                requirements: requirementsIds,
                durationStart: moment(payload.durationStart).format(),
                durationEnd: moment(payload.durationEnd).format(),
                faculty: payload.facultyId,
                updatedAt: moment().format(),
                quantity: payload.quantity,
            });
            const validation = await this.validateInputService.validate(courseInstance);
            if (validation) return validation;

            // Update course fields
            const courseRecordUpdated = await this.courseRepository.updateRecord({
                updateCondition: { id: courseInstance.id },
                updateQuery: {
                    title: courseInstance.title,
                    description: courseInstance.description,
                    code: courseInstance.code,
                    durationStart: courseInstance.durationStart,
                    durationEnd: courseInstance.durationEnd,
                    faculty: { connect: { id: courseInstance.faculty } },
                    quantity: courseInstance.quantity,
                    updatedAt: courseInstance.updatedAt,
                    createdAt: courseInstance.createdAt,
                },
            });

            if (!courseRecordUpdated) return new ResponseHandler(500, false, 'Can not update course record', null);

            // Handle Requirements updates
            if (requirementsIds.length > 0) {
                await this.courseRequirementRepository.updateManyRecord({
                    updateCondition: { id: { in: requirementsIds } },
                    updateQuery: {
                        courseId: courseInstance.id,
                    } as any,
                });
            }

            return new ResponseHandler(200, true, 'Update the course successfully', courseRecordUpdated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async permanentlyDelete(id: string): Promise<IResponseServer> {
        try {
            const facultyRecord = await this.courseRepository.permanentlyDelete(id);
            if (!facultyRecord) {
                return new ResponseHandler(404, false, `Course not found with id: ${id}`, null);
            }
            return new ResponseHandler(200, true, 'Deleted course successfully', facultyRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }
}
