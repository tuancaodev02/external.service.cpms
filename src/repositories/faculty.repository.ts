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
        where: Prisma.FacultiesWhereInput,
        queryPaging: QueryPaging,
    ): Promise<{ items: IFacultyEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.faculties.findMany({
                where,
                skip,
                take: limit,
                include: {
                    courses: true, // Include courses to match populating behavior
                },
            }),
            prisma.faculties.count({ where }),
        ]);

        return { items: items as unknown as IFacultyEntity[], totalItems };
    }

    public async getById(id: string): Promise<IFacultyEntity | null> {
        return (await prisma.faculties.findUnique({
            where: { id },
            include: {
                courses: true,
            },
        })) as unknown as IFacultyEntity;
    }

    public async getByIdNoPopulate(id: string): Promise<IFacultyEntity | null> {
        return (await prisma.faculties.findUnique({ where: { id } })) as unknown as IFacultyEntity;
    }

    public async getByCode(code: string): Promise<IFacultyEntity | null> {
        return (await prisma.faculties.findUnique({ where: { code } })) as unknown as IFacultyEntity;
    }

    public async getFacultiesMultipleId(facultyIds: string[]) {
        return await prisma.faculties.findMany({ where: { id: { in: facultyIds } } });
    }

    public async create(payload: IFacultyEntity): Promise<IFacultyEntity | null> {
        const { id, courses, ...rest } = payload;
        // payload courses is string[] of IDs? Mongoose schema implies it has courses array.
        // Prisma schema: Faculty has `courses Course[]`.
        // If payload has courses as string IDs, we connect them.

        const data: Prisma.FacultiesCreateInput = {
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
        const res = await prisma.faculties.create({ data });
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

        const res = await prisma.faculties.update({
            where: { id },
            data: updateData,
        });
        return res as unknown as IFacultyEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.FacultiesWhereUniqueInput;
        updateQuery: Prisma.FacultiesUpdateInput;
    }): Promise<IFacultyEntity | null> {
        return (await prisma.faculties.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as IFacultyEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.FacultiesWhereInput;
        updateQuery: Prisma.FacultiesUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.faculties.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async permanentlyDelete(id: string): Promise<IFacultyEntity | null> {
        return await prisma.$transaction(async (tx) => {
            // 1. Delete all UserCourses related to courses of this faculty
            await tx.userCourses.deleteMany({
                where: {
                    course: {
                        facultyId: id,
                    },
                },
            });

            // 2. Delete all CourseRegisters related to courses of this faculty
            await tx.courseRegisters.deleteMany({
                where: {
                    course: {
                        facultyId: id,
                    },
                },
            });

            // 3. Delete all CourseRequirements related to courses of this faculty
            await tx.courseRequirements.deleteMany({
                where: {
                    course: {
                        facultyId: id,
                    },
                },
            });

            // 4. Delete all Courses of this faculty
            await tx.courses.deleteMany({
                where: {
                    facultyId: id,
                },
            });

            // 5. Finally delete the Faculty itself
            const deletedFaculty = await tx.faculties.delete({
                where: { id },
            });

            return deletedFaculty as unknown as IFacultyEntity;
        });
    }
}
