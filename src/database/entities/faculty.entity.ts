import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export interface IFacultyEntity {
    id: string;
    title: string;
    description?: string;
    code: string;
    curriculum: string;
    durationStart: string;
    durationEnd: string;
    courses: string[];
    thumbnailUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class FacultyModel implements IFacultyEntity {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    curriculum: string;

    @IsString()
    @IsNotEmpty()
    durationStart: string;

    @IsString()
    @IsNotEmpty()
    durationEnd: string;

    @IsArray()
    @IsNotEmpty()
    courses: string[];

    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    @IsString()
    @IsOptional()
    createdAt?: string;

    @IsString()
    @IsOptional()
    updatedAt?: string;

    constructor(params: IFacultyEntity) {
        this.id = params.id;
        this.title = params.title;
        this.description = params.description;
        this.code = params.code;
        this.curriculum = params.curriculum;
        this.durationStart = params.durationStart;
        this.durationEnd = params.durationEnd;
        this.courses = params.courses;
        this.thumbnailUrl = params.thumbnailUrl;
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
    }
}
