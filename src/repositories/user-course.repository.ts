import type { IUserCourseEntity } from '@/database/entities/user-course.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class UserCourseRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(): Promise<IUserCourseEntity[]> {
        return (await prisma.userCourse.findMany()) as unknown as IUserCourseEntity[];
    }

    public async getById(id: string): Promise<IUserCourseEntity | null> {
        return (await prisma.userCourse.findUnique({ where: { id } })) as unknown as IUserCourseEntity;
    }

    public async getMetadataQuery(options: { updateCondition: Prisma.UserCourseWhereInput }): Promise<IUserCourseEntity | null> {
        return (await prisma.userCourse.findFirst({ where: options.updateCondition })) as unknown as IUserCourseEntity;
    }

    public async getMetadataManyRecordQuery(options: { updateCondition: Prisma.UserCourseWhereInput }): Promise<IUserCourseEntity[]> {
        return (await prisma.userCourse.findMany({ where: options.updateCondition })) as unknown as IUserCourseEntity[];
    }

    public async getRoleRecord(role: number): Promise<IUserCourseEntity | null> {
        return null;
    }

    public async getUserRoleRecord(): Promise<IUserCourseEntity | null> {
        return null;
    }

    public async getCourseMultipleId(courses: string[]) {
        return await prisma.userCourse.findMany({ where: { id: { in: courses } } });
    }

    public async create(payload: IUserCourseEntity): Promise<IUserCourseEntity | null> {
        const data: Prisma.UserCourseCreateInput = {
            id: payload.id,
            user: { connect: { id: payload.user } },
            course: { connect: { id: payload.course } },
            status: payload.status,
        };
        const res = await prisma.userCourse.create({ data });
        return res as unknown as IUserCourseEntity;
    }

    public async insertMultiple(payload: IUserCourseEntity[]): Promise<IUserCourseEntity[] | null> {
        const data = payload.map((p) => ({
            id: p.id,
            userId: p.user,
            courseId: p.course,
            status: p.status,
        }));
        await prisma.userCourse.createMany({ data });
        return payload;
    }

    public async update(payload: IUserCourseEntity): Promise<IUserCourseEntity | null> {
        const { id, ...data } = payload;
        const res = await prisma.userCourse.update({
            where: { id },
            data: {
                status: data.status,
            },
        });
        return res as unknown as IUserCourseEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.UserCourseWhereUniqueInput;
        updateQuery: Prisma.UserCourseUpdateInput;
    }): Promise<IUserCourseEntity | null> {
        return (await prisma.userCourse.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as IUserCourseEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.UserCourseWhereInput;
        updateQuery: Prisma.UserCourseUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.userCourse.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async permanentlyDelete(id: string): Promise<IUserCourseEntity | null> {
        return (await prisma.userCourse.delete({ where: { id } })) as unknown as IUserCourseEntity;
    }

    public async permanentlyDeleteMultiple(ids: string[]): Promise<Prisma.BatchPayload | null> {
        return await prisma.userCourse.deleteMany({ where: { id: { in: ids } } });
    }
}
