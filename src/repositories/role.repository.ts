import { EnumUserRole } from '@/core/constants/common.constant';
import type { IRoleEntity } from '@/database/entities/role.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class RoleRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(): Promise<IRoleEntity[]> {
        return (await prisma.roles.findMany()) as unknown as IRoleEntity[];
    }

    public async getMultipleById(ids: string[]): Promise<IRoleEntity[]> {
        return (await prisma.roles.findMany({ where: { id: { in: ids } } })) as unknown as IRoleEntity[];
    }

    public async getById(id: string): Promise<IRoleEntity | null> {
        return (await prisma.roles.findUnique({ where: { id } })) as unknown as IRoleEntity;
    }

    public async getRoleRecord(role: number): Promise<IRoleEntity | null> {
        return (await prisma.roles.findFirst({ where: { role } })) as unknown as IRoleEntity;
    }

    public async getUserRoleRecord(): Promise<IRoleEntity | null> {
        return (await prisma.roles.findFirst({ where: { role: EnumUserRole.USER } })) as unknown as IRoleEntity;
    }

    public async create(payload: IRoleEntity): Promise<IRoleEntity | null> {
        const data: Prisma.RolesCreateInput = {
            id: payload.id,
            title: payload.title,
            role: payload.role,
            description: payload.description,
            // createdAt, updatedAt handled by default/updatedAt
        };
        const res = await prisma.roles.create({ data });
        return res as unknown as IRoleEntity;
    }

    public async update(payload: IRoleEntity): Promise<IRoleEntity | null> {
        const { id, ...data } = payload;
        const res = await prisma.roles.update({
            where: { id },
            data: {
                title: data.title,
                role: data.role,
                description: data.description,
            },
        });
        return res as unknown as IRoleEntity;
    }

    public async getIdsByRoleEnums(roles: number[]): Promise<string[]> {
        const records = await prisma.roles.findMany({
            where: {
                role: { in: roles },
            },
            select: { id: true },
        });
        return records.map((r) => r.id);
    }
}
