FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
