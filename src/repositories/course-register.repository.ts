import type { ICourseRegisteringEntity } from '@/database/entities/course-register.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class CourseRegisterRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(): Promise<ICourseRegisteringEntity[]> {
        return (await prisma.courseRegister.findMany()) as unknown as ICourseRegisteringEntity[];
    }

    public async getById(id: string): Promise<ICourseRegisteringEntity | null> {
        return (await prisma.courseRegister.findUnique({ where: { id } })) as unknown as ICourseRegisteringEntity;
    }

    public async getByUserId(userId: string): Promise<ICourseRegisteringEntity[] | null> {
        return (await prisma.courseRegister.findMany({ where: { userId } })) as unknown as ICourseRegisteringEntity[];
    }

    public async getMetadataQuery(options: {
        updateCondition: Prisma.CourseRegisterWhereInput;
        updateQuery?: any;
    }): Promise<ICourseRegisteringEntity | null> {
        return (await prisma.courseRegister.findFirst({
            where: options.updateCondition,
        })) as unknown as ICourseRegisteringEntity;
    }

    public async getMetadataManyRecordQuery(options: {
        updateCondition: Prisma.CourseRegisterWhereInput;
        updateQuery?: any;
    }): Promise<ICourseRegisteringEntity[]> {
        return (await prisma.courseRegister.findMany({
            where: options.updateCondition,
        })) as unknown as ICourseRegisteringEntity[];
    }

    public async getRoleRecord(role: number): Promise<ICourseRegisteringEntity | null> {
        // Not relevant for CourseRegister? Or maybe finding by role?
        // Likely copied boilerplate or unused.
        return null;
    }

    public async getUserRoleRecord(): Promise<ICourseRegisteringEntity | null> {
        return null;
    }

    public async getCourseMultipleId(courses: string[]) {
        return await prisma.courseRegister.findMany({
            where: { id: { in: courses } },
        });
    }

    public async create(payload: ICourseRegisteringEntity): Promise<ICourseRegisteringEntity | null> {
        // Payload has user (userId) and course (courseId).
        // Entity interface says `user: string`, `course: string` (IDs).
        // Prisma model has `userId`, `courseId`.
        const data: Prisma.CourseRegisterCreateInput = {
            id: payload.id,
            user: { connect: { id: payload.user } },
            course: { connect: { id: payload.course } },
        };
        const res = await prisma.courseRegister.create({ data });
        return res as unknown as ICourseRegisteringEntity;
    }

    public async insertMultiple(payload: ICourseRegisteringEntity[]): Promise<ICourseRegisteringEntity[] | null> {
        // Prisma createMany.
        // payload comes with user and course strings.
        const data = payload.map((p) => ({
            id: p.id,
            userId: p.user,
            courseId: p.course,
        }));

        await prisma.courseRegister.createMany({ data });
        return payload;
    }

    public async update(payload: ICourseRegisteringEntity): Promise<ICourseRegisteringEntity | null> {
        const { id, user, course, ...rest } = payload;
        // user and course are IDs.
        const res = await prisma.courseRegister.update({
            where: { id },
            data: {
                ...rest,
                // userId: user, // should rarely change
                // courseId: course
            },
        });
        return res as unknown as ICourseRegisteringEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.CourseRegisterWhereUniqueInput;
        updateQuery: Prisma.CourseRegisterUpdateInput;
    }): Promise<ICourseRegisteringEntity | null> {
        return (await prisma.courseRegister.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ICourseRegisteringEntity;
    }

    public async permanentlyDelete(id: string): Promise<ICourseRegisteringEntity | null> {
        return (await prisma.courseRegister.delete({ where: { id } })) as unknown as ICourseRegisteringEntity;
    }

    public async permanentlyDeleteMultiple(ids: string[]): Promise<Prisma.BatchPayload | null> {
        return await prisma.courseRegister.deleteMany({
            where: { id: { in: ids } },
        });
    }
}
