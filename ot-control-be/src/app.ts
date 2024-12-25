import 'reflect-metadata';
import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import config from './config/config';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import organizationRoutes from './routes/organization';
import overtimeRoutes from './routes/overtime';
import { GlobalContainer } from './shared/di/container';

// 初始化依赖注入容器
GlobalContainer.initialize();

// 创建 Express 应用
const app = express();

// 配置中间件
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/overtime', overtimeRoutes);

// 错误处理中间件
app.use(errorHandler as ErrorRequestHandler);

export default app; 