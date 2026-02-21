# Stage 1: Build and compile
FROM node:20-slim as builder

WORKDIR /usr/src/app

# Define build arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY

# Set environment variables from build arguments
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Clean npm cache
RUN npm cache clean --force

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# List files for debugging
RUN ls -la

# Build the client-side assets
RUN npm run build

# List dist content for debugging
RUN ls -la dist

# Compile the server-side TypeScript
RUN npx tsc -p tsconfig.server.json

# List dist content for debugging
RUN ls -la dist

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
