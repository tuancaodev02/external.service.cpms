import type { QueryPaging } from '@/core/interfaces/common.interface';
import type { ICurriculumEntity } from '@/database/entities/curriculum.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class CurriculumRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(
        where: Prisma.CurriculumWhereInput,
        queryPaging: QueryPaging,
    ): Promise<{ items: ICurriculumEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.curriculum.findMany({
                where,
                skip,
                take: limit,
                include: {
                    faculties: true,
                },
            }),
            prisma.curriculum.count({ where }),
        ]);

        return { items: items as unknown as ICurriculumEntity[], totalItems };
    }

    public async getById(id: string): Promise<ICurriculumEntity | null> {
        return (await prisma.curriculum.findUnique({
            where: { id },
            include: {
                faculties: true,
            },
        })) as unknown as ICurriculumEntity;
    }

    public async getByIdNoPopulate(id: string): Promise<ICurriculumEntity | null> {
        return (await prisma.curriculum.findUnique({ where: { id } })) as unknown as ICurriculumEntity;
    }

    public async getByCode(code: string): Promise<ICurriculumEntity | null> {
        return (await prisma.curriculum.findUnique({ where: { code } })) as unknown as ICurriculumEntity;
    }

    public async getRoleRecord(role: number): Promise<ICurriculumEntity | null> {
        return null;
    }

    public async getUserRoleRecord(): Promise<ICurriculumEntity | null> {
        return null;
    }

    public async create(payload: ICurriculumEntity): Promise<ICurriculumEntity | null> {
        const { id, faculties, ...rest } = payload as any; // Cast as any to avoid strict check if ICurriculumEntity lacks faculties input

        const data: Prisma.CurriculumCreateInput = {
            id,
            title: rest.title,
            description: rest.description,
            code: rest.code,
            durationStart: rest.durationStart,
            durationEnd: rest.durationEnd,
        };
        const res = await prisma.curriculum.create({ data });
        return res as unknown as ICurriculumEntity;
    }

    public async update(payload: ICurriculumEntity): Promise<ICurriculumEntity | null> {
        const { id, ...data } = payload;
        const res = await prisma.curriculum.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                code: data.code,
                durationStart: data.durationStart,
                durationEnd: data.durationEnd,
            },
        });
        return res as unknown as ICurriculumEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.CurriculumWhereInput;
        updateQuery: Prisma.CurriculumUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.curriculum.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async updateRecord(options: {
        updateCondition: Prisma.CurriculumWhereUniqueInput;
        updateQuery: Prisma.CurriculumUpdateInput;
    }): Promise<ICurriculumEntity | null> {
        return (await prisma.curriculum.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ICurriculumEntity;
    }

    public async permanentlyDelete(id: string): Promise<ICurriculumEntity | null> {
        return (await prisma.curriculum.delete({ where: { id } })) as unknown as ICurriculumEntity;
    }
}
