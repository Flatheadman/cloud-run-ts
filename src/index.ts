// src/index.ts
import express, { Request, Response } from 'express';
import { createClient } from 'redis';

// --- Redis Client Setup ---
// 从环境变量获取 Redis 配置，而不是硬编码
// 这使得代码在不同环境（本地、生产）中更具移植性
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

// 创建 Redis 客户端实例
const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
    // 超时设置，防止长时间等待
    connectTimeout: 10000, 
  }
});

// 监听错误事件，避免因 Redis 错误导致整个应用崩溃
redisClient.on('error', err => console.error('Redis Client Error', err));

// 在应用启动时异步连接 Redis
(async () => {
    try {
        await redisClient.connect();
        console.log(`Successfully connected to Redis at ${redisHost}:${redisPort}`);
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();


// --- Express App Setup ---
const app = express();

// 修改根路由，实现一个简单的页面访问计数器
app.get('/', async (req: Request, res: Response) => {
  if (!redisClient.isReady) {
    // 如果 Redis 未连接，返回服务不可用状态
    return res.status(503).send('Service Unavailable: Redis connection not ready.');
  }

  try {
    // 使用 INCR 命令，这是一个原子操作，对 "visits" 键的值加 1
    const visits = await redisClient.incr('visits');
    res.status(200).send(`Hello from TypeScript on Cloud Run! Page visits: ${visits}`);
  } catch (err) {
    console.error('Error incrementing visit count in Redis:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Cloud Run 要求服务监听 PORT 环境变量
const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// 优雅停机：在接收到 SIGTERM 信号时，先关闭 Redis 连接，再关闭 HTTP 服务器
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing resources...');
  if (redisClient.isReady) {
    await redisClient.quit();
    console.log('Redis client connection closed.');
  }
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
