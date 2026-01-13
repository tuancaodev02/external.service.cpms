export interface ClassType<T = any> extends Function {
    new (...args: any[]): T;
}

declare global {
    interface DeleteResult {
        acknowledged: boolean;
        deletedCount: number;
    }
}
