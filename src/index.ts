import cors from 'cors';
import 'es6-shim';
import express from 'express';
import 'reflect-metadata';

import '@/core/configs/moment-timezone.config';
import { APP_PATH } from '@/core/constants/common.constant';
import rootRouter from '@/routes/index.route';
import ExceptionController from './controllers/exception.controller';
import Database from './database/connect.database';

const app = express();
const port: number = Number(process.env.PORT) || 5000;
const whitelist = [
    'http://localhost:3000',
    'https://external-portal-client-cpms.vercel.app',
    'https://external-portal-admin-cpms.vercel.app',
    'http://localhost:5173',
    'https://service-cpms.vercel.app',
];
app.use(
    cors((req, callback) => {
        const corsOptions = { origin: false };
        if (whitelist.indexOf(req.header('Origin') ?? '') !== -1) {
            corsOptions.origin = true;
        } else {
            corsOptions.origin = false;
        }
        callback(null, {
            ...corsOptions,
            methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
        });
    }),
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(APP_PATH, rootRouter);
app.get('/health-check', (req, res) => {
    res.status(200).json({
        code: 200,
        message: 'OK',
        data: {
            service: 'external.service.cpms',
            version: '1.0.0',
            status: 'healthy',
        },
    });
});

app.use(
    '*',
    (req, res, next) => {
        console.log(`Request received: ${req.method} - ${req.url}`);
        next();
    },
    new ExceptionController().endpointException,
);

// Initialize database connection
let isConnected = false;
const initDatabase = async () => {
    if (!isConnected) {
        await Database.connect();
        isConnected = true;
    }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
    Database.connect()
        .then(() => {
            app.listen(port, () => {
                console.log(`Listening on port ${port}`);
            });
        })
        .catch((err) => {
            console.log(err);
        });
}

export default app;
