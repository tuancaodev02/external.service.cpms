import type { QueryPaging } from '@/core/interfaces/common.interface';
import type { IAdmissionsEntity } from '@/database/entities/admissions.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class AdmissionsRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(
        where: Prisma.AdmissionWhereInput,
        queryPaging: QueryPaging,
    ): Promise<{ items: IAdmissionsEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.admission.findMany({
                where,
                skip,
                take: limit,
            }),
            prisma.admission.count({ where }),
        ]);

        return { items: items as unknown as IAdmissionsEntity[], totalItems };
    }

    public async getById(id: string): Promise<IAdmissionsEntity | null> {
        return (await prisma.admission.findUnique({ where: { id } })) as unknown as IAdmissionsEntity;
    }

    public async getByEmail(email: string): Promise<IAdmissionsEntity | null> {
        return (await prisma.admission.findFirst({ where: { email } })) as unknown as IAdmissionsEntity;
    }

    public async getMetadataQuery(options: { updateCondition: Prisma.AdmissionWhereInput }): Promise<IAdmissionsEntity | null> {
        return (await prisma.admission.findFirst({ where: options.updateCondition })) as unknown as IAdmissionsEntity;
    }

    public async getMetadataManyRecordQuery(options: { updateCondition: Prisma.AdmissionWhereInput }): Promise<IAdmissionsEntity[]> {
        return (await prisma.admission.findMany({ where: options.updateCondition })) as unknown as IAdmissionsEntity[];
    }

    public async getRoleRecord(role: number): Promise<IAdmissionsEntity | null> {
        return null;
    }

    public async getUserRoleRecord(): Promise<IAdmissionsEntity | null> {
        return null;
    }

    public async getCourseMultipleId(courses: string[]) {
        return await prisma.admission.findMany({ where: { id: { in: courses } } });
    }

    public async create(payload: IAdmissionsEntity): Promise<IAdmissionsEntity | null> {
        const { id, ...rest } = payload;
        const data: Prisma.AdmissionCreateInput = {
            id,
            name: rest.name,
            birthday: rest.birthday,
            phone: rest.phone,
            address: rest.address,
            email: rest.email,
            gender: rest.gender,
        };
        const res = await prisma.admission.create({ data });
        return res as unknown as IAdmissionsEntity;
    }

    public async insertMultiple(payload: IAdmissionsEntity[]): Promise<IAdmissionsEntity[] | null> {
        const data = payload.map((p) => ({
            id: p.id,
            name: p.name,
            birthday: p.birthday,
            phone: p.phone,
            address: p.address,
            email: p.email,
            gender: p.gender,
        }));
        await prisma.admission.createMany({ data });
        return payload;
    }

    public async update(payload: IAdmissionsEntity): Promise<IAdmissionsEntity | null> {
        const { id, ...data } = payload;
        const res = await prisma.admission.update({
            where: { id },
            data: {
                name: data.name,
                birthday: data.birthday,
                phone: data.phone,
                address: data.address,
                email: data.email,
                gender: data.gender,
            },
        });
        return res as unknown as IAdmissionsEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.AdmissionWhereUniqueInput;
        updateQuery: Prisma.AdmissionUpdateInput;
    }): Promise<IAdmissionsEntity | null> {
        return (await prisma.admission.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as IAdmissionsEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.AdmissionWhereInput;
        updateQuery: Prisma.AdmissionUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.admission.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async permanentlyDelete(id: string): Promise<IAdmissionsEntity | null> {
        return (await prisma.admission.delete({ where: { id } })) as unknown as IAdmissionsEntity;
    }

    public async permanentlyDeleteMultiple(ids: string[]): Promise<Prisma.BatchPayload | null> {
        return await prisma.admission.deleteMany({ where: { id: { in: ids } } });
    }
}
