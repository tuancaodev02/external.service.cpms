import type { IPayloadGetListUser, IPayloadUpdateUser, IPayloadUserRegisterCourse } from '@/controllers/filters/user.filter';
import { EnumUserCourseStatus } from '@/core/constants/common.constant';
import { ValidatorInput } from '@/core/helpers/class-validator.helper';
import { PermissionHelper } from '@/core/helpers/permission.helper';
import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import type { IResponseServer } from '@/core/interfaces/common.interface';
import { CoursesRegistering } from '@/database/entities/course-register.entity';
import { UserCourseModel } from '@/database/entities/user-course.entity';
import { UserModel } from '@/database/entities/user.entity';
import { CourseRegisterRepository } from '@/repositories/course-register.repository';
import { CourseRepository } from '@/repositories/course.repository';
import { RoleRepository } from '@/repositories/role.repository';
import { UserCourseRepository } from '@/repositories/user-course.repository';
import { UserRepository } from '@/repositories/user.repository';
import { Prisma } from '@prisma/client';
import moment from 'moment-timezone';
import { v4 as uuidV4 } from 'uuid';

export class UserService {
    private userRepository = new UserRepository();
    private roleRepository = new RoleRepository();
    private courseRegisterRepository = new CourseRegisterRepository();
    private userCourseRepository = new UserCourseRepository();
    private courseRepository = new CourseRepository();
    private validateInputService = new ValidatorInput();
    constructor() {}

    public async getList(payload: IPayloadGetListUser): Promise<IResponseServer> {
        try {
            const { page = 1, limit = 10, keyword } = payload;
            const where: Prisma.UsersWhereInput = {};

            if (keyword) {
                where.OR = [
                    { name: { contains: keyword } },
                    { email: { contains: keyword } },
                    { birthday: { contains: keyword } },
                    { address: { contains: keyword } },
                ];
            }
            const paging = {
                skip: (page - 1) * limit,
                limit,
                page,
            };
            const { items, totalItems } = await this.userRepository.getList(where, paging);
            const totalPages = Math.ceil(totalItems / limit);

            return new ResponseHandler(200, true, 'Get List curriculum successfully', {
                items,
                totalItems,
                totalPages,
                page,
                limit,
            });
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async getById(id: string): Promise<IResponseServer> {
        try {
            const user = await this.userRepository.getById(id);
            if (!user) return new ResponseHandler(404, false, 'User not found', null);
            return new ResponseHandler(200, true, 'Get user information successfully', user);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async registerCourse(payload: IPayloadUserRegisterCourse): Promise<IResponseServer> {
        try {
            // Check if ANY course is already registered by this user
            const courseRegisterRecord = await this.courseRegisterRepository.getMetadataQuery({
                updateCondition: {
                    userId: payload.userId, // using userId as per Prisma model
                    courseId: { in: payload.courseIds },
                },
            });
            if (courseRegisterRecord) return new ResponseHandler(400, true, 'Course registration is exits', courseRegisterRecord);

            // Functionality check: Check courses exist and quantity > 0
            const courseRecords = await this.courseRepository.getMetadataManyRecordQuery({
                updateCondition: {
                    id: { in: payload.courseIds },
                    quantity: { gt: 0 },
                },
            });

            if (!courseRecords.length)
                return new ResponseHandler(
                    400,
                    false,
                    'The number of participants for this course has reached its limit, please wait for further processing',
                    null,
                );

            const courseIds = courseRecords.map((course) => course.id);
            const newRecords = courseIds.map(
                (courseId) =>
                    new CoursesRegistering({
                        id: uuidV4(),
                        user: payload.userId,
                        course: courseId,
                    }),
            );

            // insertMultiple now uses CreateMany which creates relations based on IDs in newRecords
            const newCurriculumRecords = await this.courseRegisterRepository.insertMultiple(newRecords);
            if (!newCurriculumRecords) return new ResponseHandler(500, false, 'Can not create new curriculum', null);

            // Removed redundant userRepository.updateRecord with $addToSet/push
            // as Prisma handles reverse relations automatically.

            // Returning the updated user to match previous behavior (return User with registers)
            const userRecordUpdated = await this.userRepository.getById(payload.userId);

            return new ResponseHandler(201, true, 'Create new course register successfully', userRecordUpdated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async acceptRegisterCourse(payload: IPayloadUserRegisterCourse): Promise<IResponseServer> {
        try {
            const courseRegisterRecord = await this.courseRegisterRepository.getMetadataManyRecordQuery({
                updateCondition: {
                    userId: payload.userId,
                    courseId: { in: payload.courseIds },
                },
            });

            if (!courseRegisterRecord.length)
                return new ResponseHandler(400, true, 'Course registration not is exits', courseRegisterRecord);

            const userCourseRecords = courseRegisterRecord.map(
                (record) =>
                    new UserCourseModel({
                        id: uuidV4(),
                        user: record.user, // Assuming 'user' in entity is userId string
                        course: record.course, // Assuming 'course' in entity is courseId string
                        status: EnumUserCourseStatus.PROCESSING,
                    }),
            );

            const newUserCourseRecords = await this.userCourseRepository.insertMultiple(userCourseRecords);
            if (!newUserCourseRecords) return new ResponseHandler(500, false, 'Can not create new course register', null);

            // Removed redundant userRepository.updateRecord with $addToSet/$pull

            // Delete from CourseRegister
            await this.courseRegisterRepository.permanentlyDeleteMultiple(courseRegisterRecord.map((record) => record.id));

            // Get updated user
            const userUpdated = await this.userRepository.getById(payload.userId);

            if (!userUpdated) return new ResponseHandler(500, false, 'Can not accept course for this user', null);

            return new ResponseHandler(201, true, 'Create new course register successfully', userUpdated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async completeCourse(payload: IPayloadUserRegisterCourse): Promise<IResponseServer> {
        try {
            const courseRegisterRecord = await this.userCourseRepository.getMetadataManyRecordQuery({
                updateCondition: {
                    userId: payload.userId,
                    courseId: { in: payload.courseIds },
                },
            });
            if (!courseRegisterRecord.length)
                return new ResponseHandler(400, true, 'Course registration not is exits', courseRegisterRecord);

            const recordIds = courseRegisterRecord.map((record) => record.id);

            // Using updateManyRecord because we are updating multiple records by ID (or filter)
            const courseRegisterRecordUpdated = await this.userCourseRepository.updateManyRecord({
                updateCondition: { id: { in: recordIds } },
                updateQuery: {
                    status: { set: EnumUserCourseStatus.COMPLETED }, // Prisma updateMany data syntax
                },
            });

            return new ResponseHandler(201, true, 'Create new course register successfully', courseRegisterRecordUpdated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async update(payload: IPayloadUpdateUser, requesterRoles: number[]): Promise<IResponseServer> {
        try {
            const userRecord = await this.userRepository.getByIdNoPopulate(payload.id);
            if (!userRecord) {
                return new ResponseHandler(404, true, 'User not found', userRecord);
            }

            // Check permission if updating roles
            let rolesToUpdate: string[] | undefined = undefined;
            if (payload.roles && payload.roles.length > 0) {
                const hasPermission = requesterRoles.some((role) => PermissionHelper.isRootAdmin(role));

                if (!hasPermission) {
                    return new ResponseHandler(403, false, 'Forbidden: You do not have permission to update roles.', null);
                }

                rolesToUpdate = await this.roleRepository.getIdsByRoleEnums(payload.roles);
            }

            const newRecord = new UserModel({
                id: payload.id,
                email: payload.email.trim(),
                name: payload.name.trim(),
                birthday: payload.birthday,
                password: userRecord.password,
                address: payload.address?.trim(),
                phone: payload.phone?.trim(),
                roles: userRecord.roles, // Keep old roles for validation object
                refreshToken: userRecord.refreshToken,
                updatedAt: moment().format(),
            });

            const validation = await this.validateInputService.validate(newRecord);
            if (validation) return validation;

            // Using Prisma update
            const userRecordUpdated = await this.userRepository.updateRecord({
                updateCondition: { id: newRecord.id },
                updateQuery: {
                    email: newRecord.email,
                    name: newRecord.name,
                    birthday: newRecord.birthday,
                    address: newRecord.address,
                    phone: newRecord.phone,
                    userRoles: rolesToUpdate
                        ? {
                              deleteMany: {},
                              create: rolesToUpdate.map((roleId) => ({
                                  role: { connect: { id: roleId } },
                              })),
                          }
                        : undefined,
                    updatedAt: newRecord.updatedAt,
                },
            });

            if (!userRecordUpdated) return new ResponseHandler(500, false, 'Can not update user', null);
            return new ResponseHandler(200, true, 'Update user successfully', userRecordUpdated);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async permanentlyDelete(id: string): Promise<IResponseServer> {
        try {
            const curriculumRecord = await this.userRepository.permanentlyDelete(id);
            if (!curriculumRecord) {
                return new ResponseHandler(404, false, `curriculum not found with id: ${id}`, null);
            }
            return new ResponseHandler(200, true, 'Deleted server successfully', curriculumRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }
}
