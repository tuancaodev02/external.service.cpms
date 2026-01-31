import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export interface IUserCourseEntity {
    id: string;
    userId: string;
    status: number;
    courseId: string;
    createdAt?: string;
    updatedAt?: string;
}

export class UserCourseModel implements IUserCourseEntity {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsUUID()
    @IsNotEmpty()
    courseId: string;

    @IsNumber()
    @IsNotEmpty()
    status: number;

    @IsString()
    @IsOptional()
    createdAt?: string;

    @IsString()
    @IsOptional()
    updatedAt?: string;

    constructor(params: IUserCourseEntity) {
        this.id = params.id;
        this.userId = params.userId;
        this.courseId = params.courseId;
        this.status = params.status;
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
    }
}
