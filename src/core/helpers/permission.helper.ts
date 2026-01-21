import { EnumUserRole } from '../constants/common.constant';

export class PermissionHelper {
    constructor() {}
    public static isRootAdmin(currentRole: number) {
        return currentRole === EnumUserRole.ROOT_ADMIN;
    }

    public static isUser(currentRole: number) {
        return currentRole === EnumUserRole.USER;
    }
}
