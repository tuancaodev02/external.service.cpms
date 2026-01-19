import type { ICourseRegisteringEntity } from '@/database/entities/course-register.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class CourseRegisterRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(): Promise<ICourseRegisteringEntity[]> {
        return (await prisma.courseRegisters.findMany()) as unknown as ICourseRegisteringEntity[];
    }

    public async getById(id: string): Promise<ICourseRegisteringEntity | null> {
        return (await prisma.courseRegisters.findUnique({ where: { id } })) as unknown as ICourseRegisteringEntity;
    }

    public async getByUserId(userId: string): Promise<ICourseRegisteringEntity[] | null> {
        return (await prisma.courseRegisters.findMany({ where: { userId } })) as unknown as ICourseRegisteringEntity[];
    }

    public async getMetadataQuery(options: {
        updateCondition: Prisma.CourseRegistersWhereInput;
        updateQuery?: any;
    }): Promise<ICourseRegisteringEntity | null> {
        return (await prisma.courseRegisters.findFirst({
            where: options.updateCondition,
        })) as unknown as ICourseRegisteringEntity;
    }

    public async getMetadataManyRecordQuery(options: {
        updateCondition: Prisma.CourseRegistersWhereInput;
        updateQuery?: any;
    }): Promise<ICourseRegisteringEntity[]> {
        return (await prisma.courseRegisters.findMany({
            where: options.updateCondition,
        })) as unknown as ICourseRegisteringEntity[];
    }

    public async getCourseMultipleId(courses: string[]) {
        return await prisma.courseRegisters.findMany({
            where: { id: { in: courses } },
        });
    }

    public async create(payload: ICourseRegisteringEntity): Promise<ICourseRegisteringEntity | null> {
        // Payload has user (userId) and course (courseId).
        // Entity interface says `user: string`, `course: string` (IDs).
        // Prisma model has `userId`, `courseId`.
        const data: Prisma.CourseRegistersCreateInput = {
            id: payload.id,
            user: { connect: { id: payload.user } },
            course: { connect: { id: payload.course } },
        };
        const res = await prisma.courseRegisters.create({ data });
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

        await prisma.courseRegisters.createMany({ data });
        return payload;
    }

    public async update(payload: ICourseRegisteringEntity): Promise<ICourseRegisteringEntity | null> {
        const { id, user, course, ...rest } = payload;
        // user and course are IDs.
        const res = await prisma.courseRegisters.update({
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
        updateCondition: Prisma.CourseRegistersWhereUniqueInput;
        updateQuery: Prisma.CourseRegistersUpdateInput;
    }): Promise<ICourseRegisteringEntity | null> {
        return (await prisma.courseRegisters.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ICourseRegisteringEntity;
    }

    public async permanentlyDelete(id: string): Promise<ICourseRegisteringEntity | null> {
        return (await prisma.courseRegisters.delete({ where: { id } })) as unknown as ICourseRegisteringEntity;
    }

    public async permanentlyDeleteMultiple(ids: string[]): Promise<Prisma.BatchPayload | null> {
        return await prisma.courseRegisters.deleteMany({
            where: { id: { in: ids } },
        });
    }
}
