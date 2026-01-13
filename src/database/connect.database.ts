import { prisma } from './prisma.client';

export default class Database {
    constructor() {}

    /**
     * Connect to SQL Server database using Prisma
     * Best practice: Use Prisma Client singleton instance
     */
    public static async connect(): Promise<void> {
        try {
            // Test connection by executing a simple query
            await prisma.$connect();
            await prisma.$queryRaw`SELECT 1`;
            console.log('Connected to database successfully!!!');
        } catch (error) {
            console.error('Failed to connect to database!!!', error);
            await this.disconnect();
            throw error;
        }
    }

    /**
     * Disconnect from database
     * Best practice: Always disconnect gracefully
     */
    public static async disconnect(): Promise<void> {
        try {
            await prisma.$disconnect();
            console.log('Disconnected from the database!');
        } catch (error) {
            console.error('Failed to disconnect from the database!', error);
        }
    }

    /**
     * Get Prisma Client instance
     * Best practice: Expose Prisma client through database class
     */
    public static getClient() {
        return prisma;
    }
}
