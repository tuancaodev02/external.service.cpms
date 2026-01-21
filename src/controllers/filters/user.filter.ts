import type { ICourseRegisteringEntity } from '@/database/entities/course-register.entity';
import type { IUserEntity } from '@/database/entities/user.entity';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class GetInfoUserFilterModel implements Partial<IUserEntity> {
    @IsUUID()
    @IsNotEmpty()
    id?: string;

    constructor(payload: Partial<IUserEntity>) {
        this.id = payload.id;
    }
}
// region get list paging
export interface IPayloadGetListUser {
    page: number;
    limit: number;
    keyword?: string;
    durationStart?: string;
    durationEnd?: string;
}

export class GetPagingUserFilterModel implements Partial<IPayloadGetListUser> {
    @IsString()
    @IsOptional()
    page?: number;

    @IsString()
    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    keyword?: string;

    @IsString()
    @IsOptional()
    durationStart?: string;

    @IsString()
    @IsOptional()
    durationEnd?: string;

    constructor(payload: Partial<IPayloadGetListUser>) {
        this.page = payload.page;
        this.limit = payload.limit;
        this.keyword = payload.keyword;
        this.durationStart = payload.durationStart;
        this.durationEnd = payload.durationEnd;
    }
}

export type IPayloadUpdateUser = Omit<
    IUserEntity,
    'courses' | 'roles' | 'coursesRegistering' | 'createdAt' | 'refreshToken' | 'updatedAt'
> & {
    roles: number[];
};

export class CourseRegisterFilterModel implements Partial<IPayloadUpdateUser> {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsString()
    @IsNotEmpty()
    birthday?: string;

    @IsString()
    @IsNotEmpty()
    address?: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password?: string;

    constructor(payload: Partial<IPayloadUpdateUser>) {
        this.name = payload.name;
        this.email = payload.email;
        this.phone = payload.phone;
        this.birthday = payload.birthday;
        this.address = payload.address;
        this.password = payload.password;
    }
}

export class UpdateUserFilterModel implements Partial<IPayloadUpdateUser> {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsString()
    @IsNotEmpty()
    birthday?: string;

    @IsString()
    @IsNotEmpty()
    address?: string;

    @IsArray()
    @IsNumber()
    @IsNotEmpty()
    roles?: number[];

    constructor(payload: Partial<IPayloadUpdateUser>) {
        this.name = payload.name;
        this.email = payload.email;
        this.phone = payload.phone;
        this.birthday = payload.birthday;
        this.address = payload.address;
        this.roles = payload.roles;
    }
}

// region register course user
export type IPayloadUserRegisterCourse = Omit<ICourseRegisteringEntity, 'user' | 'id' | 'course' | 'createdAt' | 'updatedAt'> & {
    courseIds: string[];
    userId: string;
};
export class UserCourseRegisterFilterModel implements Partial<IPayloadUserRegisterCourse> {
    @IsArray()
    @IsNotEmpty()
    courseIds?: string[];

    constructor(payload: Partial<IPayloadUserRegisterCourse>) {
        this.courseIds = payload.courseIds;
    }
}

export class UserAcceptCourseRegisterFilterModel implements Partial<IPayloadUserRegisterCourse> {
    @IsUUID()
    @IsNotEmpty()
    userId?: string;

    constructor(payload: Partial<IPayloadUserRegisterCourse>) {
        this.userId = payload.userId;
    }
}
