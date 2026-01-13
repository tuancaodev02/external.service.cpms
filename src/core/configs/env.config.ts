import { normalizeKey } from '../utils/common.util';

export const environment = {
    DB_URL: process.env.DB_URL,
    // MONGO_HOST_NAME: process.env.MONGO_HOST_NAME || 'mongo',
    // MONGO_PORT: process.env.MONGO_PORT || 27017,
    // MONGO_USER: process.env.MONGO_USER,
    // MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    // MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'discord-db',

    // Authentication
    // Normalize keys to convert \n literals to actual newlines for RSA PEM format
    AUTH_PRIVATE_KEY: normalizeKey(process.env.AUTH_PRIVATE_KEY),
    AUTH_PUBLIC_KEY: normalizeKey(process.env.AUTH_PUBLIC_KEY),

    // Email Configuration
    EMAIL_ADDRESS: process.env.EMAIl_ADDRESS,
    EMAIl_PASSCODE: process.env.EMAIl_PASSCODE,
};
