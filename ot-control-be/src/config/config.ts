import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    env: string;
    jwtSecret: string;
    corsOrigin: string;
}

const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    corsOrigin: process.env.CORS_ORIGIN || '*'
};

export default config; 