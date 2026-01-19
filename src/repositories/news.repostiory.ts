import type { QueryPaging } from '@/core/interfaces/common.interface';
import type { INewsEntity } from '@/database/entities/news.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class NewsRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(where: Prisma.NewsWhereInput, queryPaging: QueryPaging): Promise<{ items: INewsEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.news.findMany({
                where,
                skip,
                take: limit,
            }),
            prisma.news.count({ where }),
        ]);

        return { items: items as unknown as INewsEntity[], totalItems };
    }

    public async getById(id: string): Promise<INewsEntity | null> {
        return (await prisma.news.findUnique({ where: { id } })) as unknown as INewsEntity;
    }

    public async getMetadataQuery(options: { updateCondition: Prisma.NewsWhereInput }): Promise<INewsEntity | null> {
        return (await prisma.news.findFirst({ where: options.updateCondition })) as unknown as INewsEntity;
    }

    public async getMetadataManyRecordQuery(options: { updateCondition: Prisma.NewsWhereInput }): Promise<INewsEntity[]> {
        return (await prisma.news.findMany({ where: options.updateCondition })) as unknown as INewsEntity[];
    }

    public async getCourseMultipleId(courses: string[]) {
        return await prisma.news.findMany({ where: { id: { in: courses } } });
    }

    public async create(payload: INewsEntity): Promise<INewsEntity | null> {
        const { id, ...rest } = payload;
        const data: Prisma.NewsCreateInput = {
            id,
            title: rest.title,
            contents: rest.contents,
            description: rest.description,
        };
        const res = await prisma.news.create({ data });
        return res as unknown as INewsEntity;
    }

    public async insertMultiple(payload: INewsEntity[]): Promise<INewsEntity[] | null> {
        const data = payload.map((p) => ({
            id: p.id,
            title: p.title,
            contents: p.contents,
            description: p.description,
        }));
        await prisma.news.createMany({ data });
        return payload;
    }

    public async update(payload: INewsEntity): Promise<INewsEntity | null> {
        const { id, ...data } = payload;
        return (await prisma.news.update({
            where: { id },
            data: {
                title: data.title,
                contents: data.contents,
                description: data.description,
            },
        })) as unknown as INewsEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.NewsWhereUniqueInput;
        updateQuery: Prisma.NewsUpdateInput;
    }): Promise<INewsEntity | null> {
        return (await prisma.news.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as INewsEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.NewsWhereInput;
        updateQuery: Prisma.NewsUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.news.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async permanentlyDelete(id: string): Promise<INewsEntity | null> {
        return (await prisma.news.delete({ where: { id } })) as unknown as INewsEntity;
    }

    public async permanentlyDeleteMultiple(ids: string[]): Promise<Prisma.BatchPayload | null> {
        return await prisma.news.deleteMany({ where: { id: { in: ids } } });
    }
}
