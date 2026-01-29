import type { QueryPaging } from '@/core/interfaces/common.interface';
import type { ICourseEntity } from '@/database/entities/course.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class CourseRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async getList(
        where: Prisma.CoursesWhereInput,
        queryPaging: QueryPaging,
    ): Promise<{ items: ICourseEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;
        const [items, totalItems] = await Promise.all([
            prisma.courses.findMany({
                where,
                skip,
                take: limit,
                include: {
                    faculty: true,
                    requirements: true,
                },
            }),
            prisma.courses.count({ where }),
        ]);

        return { items: items as unknown as ICourseEntity[], totalItems };
    }

    public async getById(id: string): Promise<ICourseEntity | null> {
        return (await prisma.courses.findUnique({
            where: { id },
            include: {
                faculty: true,
                requirements: true,
            },
        })) as unknown as ICourseEntity;
    }

    public async getByAll(): Promise<ICourseEntity[] | null> {
        return (await prisma.courses.findMany()) as unknown as ICourseEntity[];
    }

    public async getByCode(code: string): Promise<ICourseEntity | null> {
        return (await prisma.courses.findUnique({ where: { code } })) as unknown as ICourseEntity;
    }

    public async getMetadataQuery(options: { updateCondition: Prisma.CoursesWhereInput }): Promise<ICourseEntity | null> {
        return (await prisma.courses.findFirst({ where: options.updateCondition })) as unknown as ICourseEntity;
    }

    public async getMetadataManyRecordQuery(options: { updateCondition: Prisma.CoursesWhereInput }): Promise<ICourseEntity[]> {
        return (await prisma.courses.findMany({ where: options.updateCondition })) as unknown as ICourseEntity[];
    }

    public async getCourseMultipleId(requirementIds: string[]) {
        return await prisma.courses.findMany({ where: { id: { in: requirementIds } } });
    }

    public async create(payload: ICourseEntity): Promise<ICourseEntity | null> {
        const { id, ...rest } = payload;
        const facultyId = (payload as any).facultyId;
        const data: Prisma.CoursesCreateInput = {
            id,
            title: rest.title,
            code: rest.code,
            durationStart: rest.durationStart,
            durationEnd: rest.durationEnd,
            quantity: rest.quantity,
            description: rest.description,
            faculty: { connect: { id: rest.faculty } },
        };
        const res = await prisma.courses.create({ data });
        return res as unknown as ICourseEntity;
    }

    public async update(payload: ICourseEntity): Promise<ICourseEntity | null> {
        const { id, ...data } = payload;
        const res = await prisma.courses.update({
            where: { id },
            data: data as any, // Simplified
        });
        return res as unknown as ICourseEntity;
    }

    public async updateRecord(options: {
        updateCondition: Prisma.CoursesWhereUniqueInput;
        updateQuery: Prisma.CoursesUpdateInput;
    }): Promise<ICourseEntity | null> {
        return (await prisma.courses.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as ICourseEntity;
    }

    public async updateManyRecord(options: {
        updateCondition: Prisma.CoursesWhereInput;
        updateQuery: Prisma.CoursesUpdateManyMutationInput;
    }): Promise<Prisma.BatchPayload> {
        return await prisma.courses.updateMany({
            where: options.updateCondition,
            data: options.updateQuery as any, // updateMany data is stricter
        });
    }

    public async permanentlyDelete(id: string): Promise<ICourseEntity | null> {
        return await prisma.$transaction(async (tx) => {
            // 1. Delete all UserCourses related to this course
            await tx.userCourses.deleteMany({
                where: {
                    courseId: id,
                },
            });

            // 2. Delete all CourseRegisters related to this course
            await tx.courseRegisters.deleteMany({
                where: {
                    courseId: id,
                },
            });

            // 3. Delete all CourseRequirements related to this course
            await tx.courseRequirements.deleteMany({
                where: {
                    courseId: id,
                },
            });

            // 4. Finally delete the Course itself
            const deletedCourse = await tx.courses.delete({
                where: { id },
            });

            return deletedCourse as unknown as ICourseEntity;
        });
    }
}
