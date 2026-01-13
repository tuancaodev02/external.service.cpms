import type { ICourseRequirementEntity } from '@/database/entities/course-requirement.entity';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetInfoCourseRequirementFilterModel implements Partial<ICourseRequirementEntity> {
    @IsString()
    @IsNotEmpty()
    id?: string;

    constructor(payload: Partial<ICourseRequirementEntity>) {
        this.id = payload.id;
    }
}

// region get list paging
export interface IPayloadGetListCourseRequirement {
    page: number;
    limit: number;
    keyword?: string;
    durationStart?: string;
    durationEnd?: string;
}

export class GetPagingCourseRequirementFilterModel implements Partial<IPayloadGetListCourseRequirement> {
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

    constructor(payload: Partial<IPayloadGetListCourseRequirement>) {
        this.page = payload.page;
        this.limit = payload.limit;
        this.keyword = payload.keyword;
        this.durationStart = payload.durationStart;
        this.durationEnd = payload.durationEnd;
    }
}

// region create payload
export type IPayloadCreateCourseRequirement = Omit<ICourseRequirementEntity, 'id' | 'course' | 'createdAt' | 'updatedAt'> & {
    courseId: string;
};

export class CreateCourseRequirementFilterModel implements Partial<IPayloadCreateCourseRequirement> {
    @IsUUID()
    @IsNotEmpty()
    courseId?: string;

    @IsString()
    @IsNotEmpty()
    code?: string;

    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    constructor(payload: Partial<IPayloadCreateCourseRequirement>) {
        this.title = payload.title;
        this.code = payload.code;
        this.description = payload.description;
        this.courseId = payload.courseId;
    }
}

export type IPayloadUpdateCourseRequirement = Omit<ICourseRequirementEntity, 'course' | 'createdAt' | 'updatedAt'> & {
    courseId: string;
};

export class UpdateCourseRequirementFilterModel implements Partial<IPayloadUpdateCourseRequirement> {
    @IsUUID()
    @IsNotEmpty()
    courseId?: string;

    @IsString()
    @IsNotEmpty()
    code?: string;

    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    constructor(payload: Partial<IPayloadUpdateCourseRequirement>) {
        this.title = payload.title;
        this.code = payload.code;
        this.description = payload.description;
        this.courseId = payload.courseId;
    }
}
