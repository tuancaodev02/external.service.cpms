import type { Request } from 'express';

export interface IResponseServer<T = any> {
    isSuccess: boolean;
    status: number;
    data:
        | T
        | {
              items: T[];
              totalItems: number;
              totalPages: number;
              page: number;
              limit: number;
          };
    message: string;
    version: string;
}

export type IMessageError = {
    field: string;
    message: string;
};

export type TypeOptionUpdateRecord<T = any> = {
    updateCondition: any;
    updateQuery: any;
};

export interface IPayloadToken {
    id: string;
    name: string;
    roles: number[];
    email: number;
}

export interface RequestAuthorized extends Request {
    user?: IPayloadToken;
}

export interface QueryType {
    [key: string]: any;
}

export interface QueryPaging {
    skip: number;
    limit: number;
    page: number;
}
