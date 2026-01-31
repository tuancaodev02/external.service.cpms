import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export interface ICourseRegisteringEntity {
    id: string;
    userId: string;
    courseId: string;
    createdAt?: string;
    updatedAt?: string;
}

export class CoursesRegistering implements ICourseRegisteringEntity {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsUUID()
    @IsNotEmpty()
    courseId: string;

    @IsString()
    @IsOptional()
    createdAt?: string;

    @IsString()
    @IsOptional()
    updatedAt?: string;

    constructor(params: ICourseRegisteringEntity) {
        this.id = params.id;
        this.userId = params.userId;
        this.courseId = params.courseId;
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
    }
}
