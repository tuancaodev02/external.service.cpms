import type { IFacultyEntity } from '@/database/entities/faculty.entity';
import type { ISchoolEntity } from '@/database/entities/school.entity';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetInfoFacultyFilterModel implements Partial<ISchoolEntity> {
    @IsString()
    @IsNotEmpty()
    id?: string;

    constructor(payload: Partial<ISchoolEntity>) {
        this.id = payload.id;
    }
}

// region get list paging
export interface IPayloadGetListFaculty {
    page: number;
    limit: number;
    keyword?: string;
    durationStart?: string;
    durationEnd?: string;
}

export class GetPagingFacultyFilterModel implements Partial<IPayloadGetListFaculty> {
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

    constructor(payload: Partial<IPayloadGetListFaculty>) {
        this.page = payload.page;
        this.limit = payload.limit;
        this.keyword = payload.keyword;
        this.durationStart = payload.durationStart;
        this.durationEnd = payload.durationEnd;
    }
}

// region create
export type IPayloadCreateFaculty = Omit<IFacultyEntity, 'createdAt' | 'updatedAt' | 'curriculum' | 'courses'> & {
    curriculumId: string;
    courseIds: string[];
};

export class CreateFacultyFilterModel implements Partial<IPayloadCreateFaculty> {
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsString()
    @IsNotEmpty()
    code?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    durationStart?: string;

    @IsString()
    @IsNotEmpty()
    durationEnd?: string;

    @IsArray()
    @IsNotEmpty()
    courseIds?: string[];

    @IsUUID()
    @IsNotEmpty()
    curriculumId?: string;

    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    constructor(payload: Partial<IPayloadCreateFaculty>) {
        this.title = payload.title;
        this.description = payload.description;
        this.code = payload.code;
        this.durationStart = payload.durationStart;
        this.durationEnd = payload.durationEnd;
        this.curriculumId = payload.curriculumId;
        this.courseIds = payload.courseIds;
        this.thumbnailUrl = payload.thumbnailUrl;
    }
}

// region update

export type IPayloadUpdateFaculty = Omit<IFacultyEntity, 'courses' | 'curriculum' | 'createdAt' | 'updatedAt'> & {
    courseIds: string[];
    curriculumId: string;
};

export class UpdateFacultyFilterModel implements Partial<IPayloadUpdateFaculty> {
    @IsNotEmpty()
    title?: string;

    @IsString()
    @IsNotEmpty()
    code?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    durationStart?: string;

    @IsString()
    @IsNotEmpty()
    durationEnd?: string;

    @IsArray()
    @IsNotEmpty()
    courseIds?: string[];

    @IsString()
    @IsNotEmpty()
    curriculumId?: string;

    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    constructor(payload: Partial<IPayloadUpdateFaculty>) {
        this.title = payload.title;
        this.description = payload.description;
        this.code = payload.code;
        this.durationStart = payload.durationStart;
        this.durationEnd = payload.durationEnd;
        this.courseIds = payload.courseIds;
        this.curriculumId = payload.curriculumId;
        this.thumbnailUrl = payload.thumbnailUrl;
    }
}
