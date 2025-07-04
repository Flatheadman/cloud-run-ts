// src/index.ts
import express, { Request, Response } from 'express';

// 创建 Express 应用实例
const app = express();

// 定义根路由
app.get('/', (req: Request, res: Response) => {
  console.log('Request received for /');
  res.status(200).send('Hello from TypeScript on Cloud Run!');
});

// Cloud Run 要求服务监听 PORT 环境变量
const port = process.env.PORT || 8080;

// 启动服务器
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Cloud Run 会发送 SIGTERM 信号来正常关闭容器
// 我们需要捕获这个信号以实现优雅停机
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
