import type { QueryPaging } from '@/core/interfaces/common.interface';
import type { IFacultyEntity } from '@/database/entities/faculty.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class FacultyRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(
        where: Prisma.FacultyWhereInput,
        queryPaging: QueryPaging,
    ): Promise<{ items: IFacultyEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.faculty.findMany({
                where,
                skip,
                take: limit,
                include: {
                    courses: true, // Include courses to match populating behavior
                },
            }),
            prisma.faculty.count({ where }),
        ]);

        return { items: items as unknown as IFacultyEntity[], totalItems };
    }

    public async getById(id: string): Promise<IFacultyEntity | null> {
        return (await prisma.faculty.findUnique({
            where: { id },
            include: {
                courses: true,
            },
        })) as unknown as IFacultyEntity;
    }

    public async getByIdNoPopulate(id: string): Promise<IFacultyEntity | null> {
        return (await prisma.faculty.findUnique({ where: { id } })) as unknown as IFacultyEntity;
    }

    public async getByCode(code: string): Promise<IFacultyEntity | null> {
        return (await prisma.faculty.findUnique({ where: { code } })) as unknown as IFacultyEntity;
    }

    public async getRoleRecord(role: number): Promise<IFacultyEntity | null> {
        return null;
    }

    public async getUserRoleRecord(): Promise<IFacultyEntity | null> {
        return null;
    }

    public async getFacultiesMultipleId(facultyIds: string[]) {
        return await prisma.faculty.findMany({ where: { id: { in: facultyIds } } });
    }

    public async create(payload: IFacultyEntity): Promise<IFacultyEntity | null> {
        const { id, courses, ...rest } = payload;
        // payload courses is string[] of IDs? Mongoose schema implies it has courses array.
        // Prisma schema: Faculty has `courses Course[]`.
        // If payload has courses as string IDs, we connect them.

        const data: Prisma.FacultyCreateInput = {
            id,
            title: rest.title,
            description: rest.description,
            code: rest.code,
            durationStart: rest.durationStart,
            durationEnd: rest.durationEnd,
            thumbnailUrl: rest.thumbnailUrl,
            // curriculum: rest.curriculum,
            // Prisma schema: Faculty has `curriculum Curriculum`. Field `curriculumId`.
            curriculum: { connect: { id: rest.curriculum } },
            // courses connection?
        };
        const res = await prisma.faculty.create({ data });
        return res as unknown as IFacultyEntity;
    }

    public async update(payload: IFacultyEntity): Promise<IFacultyEntity | null> {
        const { id, ...data } = payload;
        // Updating fields.
        // Note: curriculum string ID -> curriculumId
        const updateData: any = {
            title: data.title,
            description: data.description,
            code: data.code,
            durationStart: data.durationStart,
            durationEnd: data.durationEnd,
            thumbnailUrl: data.thumbnailUrl,
        };
        if (data.curriculum) {
            updateData.curriculum = { connect: { id: data.curriculum } };
        }

        const res = await prisma.faculty.update({
            where: { id },
            data: updateData,
        });
        return res as unknown as IFacultyEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.FacultyWhereUniqueInput;
        updateQuery: Prisma.FacultyUpdateInput;
    }): Promise<IFacultyEntity | null> {
        return (await prisma.faculty.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as IFacultyEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.FacultyWhereInput;
        updateQuery: Prisma.FacultyUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.faculty.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async permanentlyDelete(id: string): Promise<IFacultyEntity | null> {
        return (await prisma.faculty.delete({ where: { id } })) as unknown as IFacultyEntity;
    }
}
