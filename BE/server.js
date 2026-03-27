require('dotenv').config();
const app = require('./src/app');

const BASE_PORT = Number(process.env.PORT || 3000);
const MAX_PORT_RETRY = 10;

let server;

function startServer(port, attempt = 0) {
    // Keep runtime port in env so downstream services can build correct public URLs.
    process.env.APP_RUNTIME_PORT = String(port);

    server = app.listen(port, () => {
        process.env.APP_RUNTIME_PORT = String(port);
        console.log(`🚀 Server is running on port ${port}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 URL: http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_RETRY) {
            const nextPort = port + 1;
            console.warn(`⚠️  Port ${port} is in use, retrying on ${nextPort}...`);
            startServer(nextPort, attempt + 1);
            return;
        }

        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    });
}

startServer(BASE_PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server?.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = server;
