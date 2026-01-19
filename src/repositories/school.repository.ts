import type { ISchoolEntity } from '@/database/entities/school.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class SchoolRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async checkRecordExists(id: string): Promise<{ id: string } | null> {
        const res = await prisma.schools.findUnique({
            where: { id },
            select: { id: true },
        });
        return res;
    }

    public async getList(): Promise<ISchoolEntity[]> {
        return (await prisma.schools.findMany()) as unknown as ISchoolEntity[];
    }

    public async getByCode(code: string): Promise<ISchoolEntity | null> {
        return (await prisma.schools.findUnique({ where: { code } })) as unknown as ISchoolEntity;
    }

    public async getById(id: string): Promise<ISchoolEntity | null> {
        return (await prisma.schools.findUnique({ where: { id } })) as unknown as ISchoolEntity;
    }

    public async create(payload: ISchoolEntity): Promise<ISchoolEntity | null> {
        const { id, ...rest } = payload;
        const data: Prisma.SchoolsCreateInput = {
            id,
            title: rest.title,
            code: rest.code,
            address: rest.address,
            email: rest.email,
            phone: rest.phone,
            logoUrl: rest.logoUrl,
            description: rest.description,
        };
        const res = await prisma.schools.create({ data });
        return res as unknown as ISchoolEntity;
    }

    public async update(payload: ISchoolEntity): Promise<ISchoolEntity | null> {
        const { id, ...data } = payload;
        return (await prisma.schools.update({
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
        updateCondition: Prisma.SchoolsWhereUniqueInput;
        updateQuery: Prisma.SchoolsUpdateInput;
    }): Promise<ISchoolEntity | null> {
        return (await prisma.schools.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ISchoolEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.SchoolsWhereInput;
        updateQuery: Prisma.SchoolsUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.schools.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }
}
