# ---- Stage 1: Build ----
# 使用一个包含完整 Node.js 开发环境的镜像来构建项目
FROM node:20-slim AS builder

WORKDIR /app

# 复制 package.json 和 lockfile
COPY package*.json ./

# 安装所有依赖，包括 devDependencies 用于编译
RUN npm install

# 复制 TypeScript 源代码和配置文件
COPY ./src ./src
COPY tsconfig.json .

# 运行 build 脚本，将 TypeScript 编译成 JavaScript
RUN npm run build
# 此时，编译后的 JS 代码位于 /app/dist 目录


# ---- Stage 2: Production ----
# 使用一个干净、轻量的 Node.js 镜像作为最终的生产环境
FROM node:20-slim

WORKDIR /app

# 从 builder 阶段复制 package.json 和 lockfile
COPY --from=builder /app/package*.json ./

# 只安装生产依赖，这会使镜像更小、更安全
RUN npm ci --omit=dev

# 从 builder 阶段复制编译好的 JavaScript 代码
COPY --from=builder /app/dist ./dist

# 设置容器启动时要执行的命令
CMD [ "node", "dist/index.js" ]
