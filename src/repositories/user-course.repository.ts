import type { IUserCourseEntity } from '@/database/entities/user-course.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class UserCourseRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(): Promise<IUserCourseEntity[]> {
        return (await prisma.userCourses.findMany()) as unknown as IUserCourseEntity[];
    }

    public async getById(id: string): Promise<IUserCourseEntity | null> {
        return (await prisma.userCourses.findUnique({ where: { id } })) as unknown as IUserCourseEntity;
    }

    public async getMetadataQuery(options: { updateCondition: Prisma.UserCoursesWhereInput }): Promise<IUserCourseEntity | null> {
        return (await prisma.userCourses.findFirst({ where: options.updateCondition })) as unknown as IUserCourseEntity;
    }

    public async getMetadataManyRecordQuery(options: { updateCondition: Prisma.UserCoursesWhereInput }): Promise<IUserCourseEntity[]> {
        return (await prisma.userCourses.findMany({ where: options.updateCondition })) as unknown as IUserCourseEntity[];
    }

    public async getCourseMultipleId(courses: string[]) {
        return await prisma.userCourses.findMany({ where: { id: { in: courses } } });
    }

    public async create(payload: IUserCourseEntity): Promise<IUserCourseEntity | null> {
        const data: Prisma.UserCoursesCreateInput = {
            id: payload.id,
            user: { connect: { id: payload.userId } },
            course: { connect: { id: payload.courseId } },
            status: payload.status,
        };
        const res = await prisma.userCourses.create({ data });
        return res as unknown as IUserCourseEntity;
    }

    public async insertMultiple(payload: IUserCourseEntity[]): Promise<IUserCourseEntity[] | null> {
        const data = payload.map((p) => ({
            id: p.id,
            userId: p.userId,
            courseId: p.courseId,
            status: p.status,
        }));
        await prisma.userCourses.createMany({ data });
        return payload;
    }

    public async update(payload: IUserCourseEntity): Promise<IUserCourseEntity | null> {
        const { id, ...data } = payload;
        const res = await prisma.userCourses.update({
            where: { id },
            data: {
                status: data.status,
            },
        });
        return res as unknown as IUserCourseEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.UserCoursesWhereUniqueInput;
        updateQuery: Prisma.UserCoursesUpdateInput;
    }): Promise<IUserCourseEntity | null> {
        return (await prisma.userCourses.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as IUserCourseEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.UserCoursesWhereInput;
        updateQuery: Prisma.UserCoursesUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.userCourses.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async permanentlyDelete(id: string): Promise<IUserCourseEntity | null> {
        return (await prisma.userCourses.delete({ where: { id } })) as unknown as IUserCourseEntity;
    }

    public async permanentlyDeleteMultiple(ids: string[]): Promise<Prisma.BatchPayload | null> {
        return await prisma.userCourses.deleteMany({ where: { id: { in: ids } } });
    }
}
