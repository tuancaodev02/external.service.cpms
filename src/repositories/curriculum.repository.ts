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
        where: Prisma.CurriculaWhereInput,
        queryPaging: QueryPaging,
    ): Promise<{ items: ICurriculumEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.curricula.findMany({
                where,
                skip,
                take: limit,
                include: {
                    faculties: true,
                },
            }),
            prisma.curricula.count({ where }),
        ]);

        return { items: items as unknown as ICurriculumEntity[], totalItems };
    }

    public async getById(id: string): Promise<ICurriculumEntity | null> {
        return (await prisma.curricula.findUnique({
            where: { id },
            include: {
                faculties: true,
            },
        })) as unknown as ICurriculumEntity;
    }

    public async getByIdNoPopulate(id: string): Promise<ICurriculumEntity | null> {
        return (await prisma.curricula.findUnique({ where: { id } })) as unknown as ICurriculumEntity;
    }

    public async getByCode(code: string): Promise<ICurriculumEntity | null> {
        return (await prisma.curricula.findUnique({ where: { code } })) as unknown as ICurriculumEntity;
    }

    public async create(payload: ICurriculumEntity): Promise<ICurriculumEntity | null> {
        const { id, faculties, ...rest } = payload as any; // Cast as any to avoid strict check if ICurriculumEntity lacks faculties input

        const data: Prisma.CurriculaCreateInput = {
            id,
            title: rest.title,
            description: rest.description,
            code: rest.code,
            durationStart: rest.durationStart,
            durationEnd: rest.durationEnd,
        };
        const res = await prisma.curricula.create({ data });
        return res as unknown as ICurriculumEntity;
    }

    public async update(payload: ICurriculumEntity): Promise<ICurriculumEntity | null> {
        const { id, ...data } = payload;
        const res = await prisma.curricula.update({
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
        updateCondition: Prisma.CurriculaWhereInput;
        updateQuery: Prisma.CurriculaUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.curricula.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async updateRecord(options: {
        updateCondition: Prisma.CurriculaWhereUniqueInput;
        updateQuery: Prisma.CurriculaUpdateInput;
    }): Promise<ICurriculumEntity | null> {
        return (await prisma.curricula.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ICurriculumEntity;
    }

    public async permanentlyDelete(id: string): Promise<ICurriculumEntity | null> {
        return await prisma.$transaction(async (tx) => {
            // 1. Delete all UserCourses related to courses in faculties of this curriculum
            await tx.userCourses.deleteMany({
                where: {
                    course: {
                        faculty: {
                            curriculumId: id,
                        },
                    },
                },
            });

            // 2. Delete all CourseRegisters related to courses...
            await tx.courseRegisters.deleteMany({
                where: {
                    course: {
                        faculty: {
                            curriculumId: id,
                        },
                    },
                },
            });

            // 3. Delete all CourseRequirements related to courses...
            await tx.courseRequirements.deleteMany({
                where: {
                    course: {
                        faculty: {
                            curriculumId: id,
                        },
                    },
                },
            });

            // 4. Delete all Courses related to faculties of this curriculum
            await tx.courses.deleteMany({
                where: {
                    faculty: {
                        curriculumId: id,
                    },
                },
            });

            // 5. Delete all Faculties of this curriculum
            await tx.faculties.deleteMany({
                where: {
                    curriculumId: id,
                },
            });

            // 6. Finally delete the Curriculum itself
            const deletedCurriculum = await tx.curricula.delete({
                where: { id },
            });

            return deletedCurriculum as unknown as ICurriculumEntity;
        });
    }
}
