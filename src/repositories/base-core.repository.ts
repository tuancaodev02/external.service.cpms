export class BaseRepository {
    constructor() {}

    /**
     * @deprecated No longer needed for Prisma. Returns object as is.
     */
    protected formatterObjectId(object: Object, options?: any) {
        return object;
    }

    /**
     * @deprecated No longer needed for Prisma. Returns array as is.
     */
    protected formatterArrayIds<T extends Object>(array: Array<T>, options?: any) {
        return array;
    }
}
