import type { ISchoolEntity } from '@/database/entities/school.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class SchoolRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async checkRecordExists(id: string): Promise<{ id: string } | null> {
        const res = await prisma.school.findUnique({
            where: { id },
            select: { id: true },
        });
        return res;
    }

    public async getList(): Promise<ISchoolEntity[]> {
        return (await prisma.school.findMany()) as unknown as ISchoolEntity[];
    }

    public async getByCode(code: string): Promise<ISchoolEntity | null> {
        return (await prisma.school.findUnique({ where: { code } })) as unknown as ISchoolEntity;
    }

    public async getById(id: string): Promise<ISchoolEntity | null> {
        return (await prisma.school.findUnique({ where: { id } })) as unknown as ISchoolEntity;
    }

    public async create(payload: ISchoolEntity): Promise<ISchoolEntity | null> {
        const { id, ...rest } = payload;
        const data: Prisma.SchoolCreateInput = {
            id,
            title: rest.title,
            code: rest.code,
            address: rest.address,
            email: rest.email,
            phone: rest.phone,
            logoUrl: rest.logoUrl,
            description: rest.description,
        };
        const res = await prisma.school.create({ data });
        return res as unknown as ISchoolEntity;
    }

    public async update(payload: ISchoolEntity): Promise<ISchoolEntity | null> {
        const { id, ...data } = payload;
        return (await prisma.school.update({
            where: { id },
            data: {
                title: data.title,
                code: data.code,
                address: data.address,
                email: data.email,
                phone: data.phone,
                logoUrl: data.logoUrl,
                description: data.description,
            },
        })) as unknown as ISchoolEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.SchoolWhereUniqueInput;
        updateQuery: Prisma.SchoolUpdateInput;
    }): Promise<ISchoolEntity | null> {
        return (await prisma.school.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ISchoolEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.SchoolWhereInput;
        updateQuery: Prisma.SchoolUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.school.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }
}
