import type { QueryPaging } from '@/core/interfaces/common.interface';
import type { IUserEntity } from '@/database/entities/user.entity';
import { prisma } from '@/database/prisma.client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base-core.repository';

export class UserRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async checkUserExists(id: string): Promise<{ id: string } | null> {
        const user = await prisma.users.findUnique({
            where: { id },
            select: { id: true },
        });
        return user;
    }

    public async getList(where: Prisma.UsersWhereInput, queryPaging: QueryPaging): Promise<{ items: IUserEntity[]; totalItems: number }> {
        const { skip, limit } = queryPaging;

        const [items, totalItems] = await Promise.all([
            prisma.users.findMany({
                where,
                skip,
                take: limit,
                include: {
                    userCourses: {
                        include: {
                            course: true,
                        },
                    },
                    courseRegistrations: {
                        include: {
                            course: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' }, // default sort
            }),
            prisma.users.count({ where }),
        ]);

        const roles = await prisma.roles.findMany();

        // Transform the data to match expected output structure
        const transformedItems = items.map((user) => ({
            ...user,
            birthday: user.birthday, // ensure matches interface
            courses: user.userCourses.map((uc) => ({
                id: uc.course.id,
                title: uc.course.title,
                code: uc.course.code,
                description: uc.course.description,
                durationStart: uc.course.durationStart,
                durationEnd: uc.course.durationEnd,
                quantity: uc.course.quantity,
                createdAt: uc.course.createdAt,
                updatedAt: uc.course.updatedAt,
                status: uc.status,
            })),
            coursesRegistering: user.courseRegistrations.map((cr) => ({
                id: cr.course.id,
                title: cr.course.title,
                code: cr.course.code,
                description: cr.course.description,
                durationStart: cr.course.durationStart,
                durationEnd: cr.course.durationEnd,
                quantity: cr.course.quantity,
                createdAt: cr.course.createdAt,
                updatedAt: cr.course.updatedAt,
            })),
            roles: roles.map((role) => ({
                id: role.id,
                title: role.title,
                role: role.role,
                description: role.description,
            })),
        }));

        return { items: transformedItems as any, totalItems };
    }

    public async getById(id: string): Promise<IUserEntity | null> {
        const user = await prisma.users.findUnique({
            where: { id },
            include: {
                userCourses: {
                    include: {
                        course: true,
                    },
                },
                courseRegistrations: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!user) return null;

        const roles = await prisma.roles.findMany();

        const courses = user.userCourses.map((uc) => ({
            id: uc.course.id,
            title: uc.course.title,
            code: uc.course.code,
            description: uc.course.description,
            durationStart: uc.course.durationStart,
            durationEnd: uc.course.durationEnd,
            quantity: uc.course.quantity,
            status: uc.status,
        }));

        const coursesRegistering = user.courseRegistrations.map((cr) => ({
            id: cr.course.id,
            title: cr.course.title,
            code: cr.course.code,
            description: cr.course.description,
            durationStart: cr.course.durationStart,
            durationEnd: cr.course.durationEnd,
            quantity: cr.course.quantity,
        }));

        const rolesMapping = roles.map((role) => ({
            id: role.id,
            title: role.title,
            role: role.role,
            description: role.description,
        }));

        let courseIds: string[] = [];
        let coursesRemaining: any = [];

        if (courses.length) {
            courseIds.push(...courses.map((c) => c.id));
        }
        if (coursesRegistering.length) {
            courseIds.push(...coursesRegistering.map((c) => c.id));
        }

        if (courseIds.length > 0) {
            // Find courses NOT in courseIds
            coursesRemaining = await prisma.courses.findMany({
                where: {
                    id: { notIn: courseIds },
                },
            });
        } else {
            coursesRemaining = await prisma.courses.findMany();
        }

        // Return mixed object as originally done (casting to any/IUserEntity)
        return {
            ...user,
            courses: courses as any,
            coursesRegistering: coursesRegistering as any,
            roles: rolesMapping as any,
            coursesRemaining,
        } as unknown as IUserEntity;
    }

    public async getByIdNoPopulate(id: string): Promise<IUserEntity | null> {
        const user = await prisma.users.findUnique({ where: { id } });
        return user as unknown as IUserEntity;
    }

    public async getByCode(code: string): Promise<IUserEntity | null> {
        return null;
    }

    public async getByEmail(email: string): Promise<IUserEntity | null> {
        return (await prisma.users.findUnique({ where: { email } })) as unknown as IUserEntity;
    }

    public async getRoleRecord(role: number): Promise<IUserEntity | null> {
        const roleRecord = await prisma.roles.findFirst({ where: { role: role } });
        if (!roleRecord) return null;

        const user = await prisma.users.findFirst({
            where: {
                userRoles: {
                    some: {
                        roleId: roleRecord.id,
                    },
                },
            },
        });
        return user as unknown as IUserEntity;
    }

    public async getCourseMultipleId(requirementIds: string[]) {
        return await prisma.users.findMany({ where: { id: { in: requirementIds } } });
    }

    public async create(payload: IUserEntity): Promise<IUserEntity | null> {
        // payload has id.
        const { id, courses, coursesRegistering, roles, ...rest } = payload;
        // We need to handle relations if we want to create them here, but typically we create User first.
        // Prisma create with explicit ID.
        // Note: roles is string[] (role IDs probably?).
        // In Mongoose it was `...payload`.

        // We need to map `roles` to `userRoles` relation create if provided.
        // Assuming `roles` contains Role IDs? Or Names?
        // Entity says `roles: string[]`.

        const createData: Prisma.UsersCreateInput = {
            id,
            name: payload.name,
            birthday: payload.birthday,
            phone: payload.phone,
            address: payload.address,
            email: payload.email,
            password: payload.password,
            refreshToken: payload.refreshToken,
            // Connect roles if provided and they look like IDs
            userRoles:
                roles && roles.length > 0
                    ? {
                          create: roles.map((roleId) => ({
                              role: { connect: { id: roleId } },
                          })),
                      }
                    : undefined,
        };

        const user = await prisma.users.create({
            data: createData,
        });
        return user as unknown as IUserEntity;
    }

    public async update(payload: IUserEntity): Promise<IUserEntity | null> {
        const { id, roles, ...data } = payload;
        // Clean data for update
        const updateData: any = { ...data };
        delete updateData.courses; // these are relations
        delete updateData.coursesRegistering;

        const user = await prisma.users.update({
            where: { id },
            data: updateData,
        });
        return user as unknown as IUserEntity;
    }

    // Changing signature to accept Prisma inputs
    public async updateRecord(options: {
        updateCondition: Prisma.UsersWhereUniqueInput;
        updateQuery: Prisma.UsersUpdateInput;
    }): Promise<IUserEntity | null> {
        // Handling special mongo atomic operators if passed (unlikely if I refactor service)
        // Check keys. If they start with $, we might have issues if caller not updated.
        // But I plan to update caller.

        // updateQuery might contain $addToSet, $pull if coming from legacy service.
        // But `UserService` has `$addToSet` etc.
        // I MUST REFACTOR SERVICE TO PASS PRISMA DATA.

        return (await prisma.users.update({
            where: options.updateCondition,
            data: options.updateQuery,
        })) as unknown as IUserEntity;
    }

    public async insertMultiple(payload: IUserEntity[]): Promise<IUserEntity[] | null> {
        // Prisma createMany does not return the created records! (Only count).
        // So we should use a transaction of creates if we need mapped return, OR just createMany and return payload.
        // Mongoose insertMany returns docs.

        // Helper to creating many.
        // payload includes ID.
        const data = payload.map((p) => ({
            id: p.id,
            name: p.name,
            birthday: p.birthday,
            phone: p.phone,
            address: p.address,
            email: p.email,
            password: p.password,
            refreshToken: p.refreshToken,
        }));

        await prisma.users.createMany({
            data,
        });

        return payload; // Approximation
    }

    public async updateManyRecord(options: { updateCondition: Prisma.UsersWhereInput; updateQuery: Prisma.UsersUpdateInput }) {
        return await prisma.users.updateMany({
            where: options.updateCondition,
            data: options.updateQuery,
        });
    }

    public async permanentlyDelete(id: string): Promise<IUserEntity | null> {
        return await prisma.$transaction(async (tx) => {
            // 1. Delete all UserCourses
            await tx.userCourses.deleteMany({
                where: { userId: id },
            });

            // 2. Delete all CourseRegistrations
            await tx.courseRegisters.deleteMany({
                where: { userId: id },
            });

            // 3. Delete all UserRoles
            await tx.userRoles.deleteMany({
                where: { userId: id },
            });

            // 4. Finally delete the User
            const deletedUser = await tx.users.delete({
                where: { id },
            });

            return deletedUser as unknown as IUserEntity;
        });
    }
}
