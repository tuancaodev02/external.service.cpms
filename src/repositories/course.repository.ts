import type { QueryPaging } from '@/core/interfaces/common.interface';
import type { ICourseEntity } from '@/database/entities/course.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class CourseRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(
        where: Prisma.CourseWhereInput,
        queryPaging: QueryPaging,
    ): Promise<{ items: ICourseEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.course.findMany({
                where,
                skip,
                take: limit,
                include: {
                    faculty: true,
                    requirements: true,
                },
            }),
            prisma.course.count({ where }),
        ]);

        return { items: items as unknown as ICourseEntity[], totalItems };
    }

    public async getById(id: string): Promise<ICourseEntity | null> {
        return (await prisma.course.findUnique({
            where: { id },
            include: {
                faculty: true,
                requirements: true,
            },
        })) as unknown as ICourseEntity;
    }

    public async getByAll(): Promise<ICourseEntity[] | null> {
        return (await prisma.course.findMany()) as unknown as ICourseEntity[];
    }

    public async getByCode(code: string): Promise<ICourseEntity | null> {
        return (await prisma.course.findUnique({ where: { code } })) as unknown as ICourseEntity;
    }

    public async getMetadataQuery(options: { updateCondition: Prisma.CourseWhereInput }): Promise<ICourseEntity | null> {
        return (await prisma.course.findFirst({ where: options.updateCondition })) as unknown as ICourseEntity;
    }

    public async getMetadataManyRecordQuery(options: { updateCondition: Prisma.CourseWhereInput }): Promise<ICourseEntity[]> {
        return (await prisma.course.findMany({ where: options.updateCondition })) as unknown as ICourseEntity[];
    }

    public async getRoleRecord(role: number): Promise<ICourseEntity | null> {
        return null;
    }

    public async getUserRoleRecord(): Promise<ICourseEntity | null> {
        return null;
    }

    public async getCourseMultipleId(requirementIds: string[]) {
        return await prisma.course.findMany({ where: { id: { in: requirementIds } } });
    }

    public async create(payload: ICourseEntity): Promise<ICourseEntity | null> {
        const { id, ...rest } = payload;
        const facultyId = (payload as any).facultyId;
        const data: Prisma.CourseCreateInput = {
            id,
            title: rest.title,
            code: rest.code,
            durationStart: rest.durationStart,
            durationEnd: rest.durationEnd,
            quantity: rest.quantity,
            description: rest.description,
            faculty: { connect: { id: rest.faculty } },
        };
        const res = await prisma.course.create({ data });
        return res as unknown as ICourseEntity;
    }

    public async update(payload: ICourseEntity): Promise<ICourseEntity | null> {
        const { id, ...data } = payload;
        const res = await prisma.course.update({
            where: { id },
            data: data as any, // Simplified
        });
        return res as unknown as ICourseEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.CourseWhereUniqueInput;
        updateQuery: Prisma.CourseUpdateInput;
    }): Promise<ICourseEntity | null> {
        return (await prisma.course.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ICourseEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.CourseWhereInput;
        updateQuery: Prisma.CourseUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.course.updateMany({
            where: options.updateCondition,
            data: options.updateQuery as any, // updateMany data is stricter
        });
    }

    public async permanentlyDelete(id: string): Promise<ICourseEntity | null> {
        return (await prisma.course.delete({ where: { id } })) as unknown as ICourseEntity;
    }
}
