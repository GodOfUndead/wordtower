# Build stage for client
FROM node:18-alpine as client-build

WORKDIR /app/client

# Copy client files
COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Build stage for server
FROM node:18-alpine as server-build

WORKDIR /app/server

# Copy server files
COPY server/package*.json ./
RUN npm install

COPY server/ ./

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built client files
COPY --from=client-build /app/client/build ./client/build

# Copy server files
COPY --from=server-build /app/server ./server

# Install production dependencies
WORKDIR /app/server
RUN npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"] 