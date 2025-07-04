# Use the official Node.js runtime as the base image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript source code
COPY src/ ./src/
COPY tsconfig.json ./

# Install TypeScript and build
RUN npm install typescript @types/node @types/express && \
    npm run build && \
    npm uninstall typescript @types/node @types/express

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
