import app from './app';
import config from './config/config';

const startServer = () => {
    try {
        const server = app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
            console.log(`Environment: ${config.env}`);
        });

        // 优雅关闭
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 