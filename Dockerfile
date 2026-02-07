# Stage 1: Build and compile
FROM node:20-slim as builder

WORKDIR /usr/src/app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the client-side assets and compile the server-side TypeScript
RUN npm run build && npx tsc -p tsconfig.server.json

# Stage 2: Create the final production image
FROM node:20-slim

WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the compiled client and server code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist


# Expose port 8080 and start the server
EXPOSE 8080
CMD [ "node", "dist/server.js" ]
