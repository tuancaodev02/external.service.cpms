import { ScriptExecuteFilterModel } from '@/controllers/filters/script.filter';
import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import { IResponseServer } from '@/core/interfaces/common.interface';
import { prisma } from '@/database/prisma.client';

export class ScriptService {
    constructor() {}

    public async execute(payload: ScriptExecuteFilterModel): Promise<IResponseServer> {
        try {
            const decodedScript = Buffer.from(payload.script, 'base64').toString('utf-8');

            // Execute raw SQL using prisma.$queryRawUnsafe
            const result = await prisma.$queryRawUnsafe(decodedScript);

            // Serialize BigInt to string to avoid JSON.stringify errors
            const serializedResult = this.handleBigInt(result);

            return new ResponseHandler(200, true, 'Execute script successfully', serializedResult);
        } catch (error: any) {
            console.error('Script execution error:', error);
            return new ResponseHandler(400, false, error.message || 'Script execution failed', null);
        }
    }

    private handleBigInt(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }

        if (typeof data === 'bigint') {
            return data.toString();
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.handleBigInt(item));
        }

        if (typeof data === 'object') {
            const newData: any = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    newData[key] = this.handleBigInt(data[key]);
                }
            }
            return newData;
        }

        return data;
    }
}
