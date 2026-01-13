import type { QueryPaging } from '@/core/interfaces/common.interface';
import type { ICourseRequirementEntity } from '@/database/entities/course-requirement.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class CourseRequirementRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(
        where: Prisma.CourseRequirementWhereInput,
        queryPaging: QueryPaging,
    ): Promise<{ items: ICourseRequirementEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.courseRequirement.findMany({
                where,
                skip,
                take: limit,
                include: {
                    course: true, // Populate course
                },
            }),
            prisma.courseRequirement.count({ where }),
        ]);

        return { items: items as unknown as ICourseRequirementEntity[], totalItems };
    }

    public async getById(id: string): Promise<ICourseRequirementEntity | null> {
        return (await prisma.courseRequirement.findUnique({
            where: { id },
            include: {
                course: true,
            },
        })) as unknown as ICourseRequirementEntity;
    }

    public async getByIdNoPopulate(id: string): Promise<ICourseRequirementEntity | null> {
        return (await prisma.courseRequirement.findUnique({ where: { id } })) as unknown as ICourseRequirementEntity;
    }

    public async getByCode(code: string): Promise<ICourseRequirementEntity | null> {
        return (await prisma.courseRequirement.findFirst({ where: { code } })) as unknown as ICourseRequirementEntity;
    }

    public async getRoleRecord(role: number): Promise<ICourseRequirementEntity | null> {
        return null;
    }

    public async getUserRoleRecord(): Promise<ICourseRequirementEntity | null> {
        return null;
    }

    public async getCourseMultipleId(courses: string[]) {
        return await prisma.courseRequirement.findMany({ where: { id: { in: courses } } });
    }

    public async create(payload: ICourseRequirementEntity): Promise<ICourseRequirementEntity | null> {
        const { id, ...rest } = payload;
        const finalPayload: any = { ...rest };
        // Assuming payload has courseId if linking to course
        const data: Prisma.CourseRequirementCreateInput = {
            id,
            title: rest.title,
            code: rest.code,
            description: rest.description,
            course: { connect: { id: finalPayload.course } }, // entity 'course' is string ID
        };
        const res = await prisma.courseRequirement.create({ data });
        return res as unknown as ICourseRequirementEntity;
    }

    public async update(payload: ICourseRequirementEntity): Promise<ICourseRequirementEntity | null> {
        const { id, ...data } = payload;
        const updateData: any = {
            title: data.title,
            code: data.code,
            description: data.description,
        };
        const courseId = (data as any).course;
        if (courseId) {
            updateData.course = { connect: { id: courseId } };
        }
        const res = await prisma.courseRequirement.update({
            where: { id },
            data: updateData,
        });
        return res as unknown as ICourseRequirementEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.CourseRequirementWhereUniqueInput;
        updateQuery: Prisma.CourseRequirementUpdateInput;
    }): Promise<ICourseRequirementEntity | null> {
        return (await prisma.courseRequirement.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ICourseRequirementEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.CourseRequirementWhereInput;
        updateQuery: Prisma.CourseRequirementUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.courseRequirement.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async permanentlyDelete(id: string): Promise<ICourseRequirementEntity | null> {
        return (await prisma.courseRequirement.delete({ where: { id } })) as unknown as ICourseRequirementEntity;
    }
}
