import { ScriptExecuteFilterModel } from '@/controllers/filters/script.filter';
import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import { IResponseServer } from '@/core/interfaces/common.interface';
import { prisma } from '@/database/prisma.client';

export class ScriptService {
    constructor() {}

    public async execute(payload: ScriptExecuteFilterModel): Promise<IResponseServer> {
        try {
            const decodedScript = Buffer.from(payload.script, 'base64').toString('utf-8');

            // Split script by 'GO' keyword (case-insensitive, on its own line)
            // Regex handles: start of line or newline, optional whitespace, GO, optional whitespace, end of line
            const batches = decodedScript.split(/^\s*GO\s*$/gim).filter((batch) => batch.trim().length > 0);

            const results = [];

            for (const batch of batches) {
                // Determine if it's likely a query (SELECT) or DDL/DML
                const trimmedBatch = batch.trim().toUpperCase();

                // If it starts with SELECT, assume query returning data
                if (trimmedBatch.startsWith('SELECT') || trimmedBatch.startsWith('WITH') || trimmedBatch.startsWith('EXEC')) {
                    const result = await prisma.$queryRawUnsafe(batch);
                    results.push(this.handleBigInt(result));
                } else {
                    // DDL (CREATE, ALTER, DROP) or DML (INSERT, UPDATE, DELETE) -> use executeRawUnsafe
                    // executeRawUnsafe returns number of affected rows
                    const count = await prisma.$executeRawUnsafe(batch);
                    results.push({ affectedRows: typeof count === 'bigint' ? (count as bigint).toString() : count });
                }
            }

            return new ResponseHandler(200, true, 'Execute script successfully', results.length === 1 ? results[0] : results);
        } catch (error: any) {
            console.error('Script execution error:', error.message);
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
