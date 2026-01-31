import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export interface IUserEntity {
    id: string;
    name: string;
    birthday: string;
    phone: string;
    address: string;
    email: string;
    password: string;
    roles: string[];
    refreshToken: string;
    courses?: string[];
    coursesRegistering?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export class UserModel implements IUserEntity {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    birthday: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsArray()
    @IsNotEmpty()
    roles: string[];

    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    @IsArray()
    @IsOptional()
    courses?: string[];

    @IsArray()
    @IsOptional()
    coursesRegistering?: string[];

    @IsString()
    @IsOptional()
    createdAt?: string;

    @IsString()
    @IsOptional()
    updatedAt?: string;

    constructor(params: IUserEntity) {
        this.id = params.id;
        this.name = params.name;
        this.birthday = params.birthday;
        this.phone = params.phone;
        this.address = params.address;
        this.email = params.email;
        this.password = params.password;
        this.roles = params.roles || [];
        this.refreshToken = params.refreshToken;
        this.courses = params.courses;
        this.coursesRegistering = params.coursesRegistering;
        this.createdAt = params.createdAt;
        this.updatedAt = params.updatedAt;
    }
}
