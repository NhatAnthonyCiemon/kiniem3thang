# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production
RUN npx prisma generate
COPY . .

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/src ./src
COPY --from=builder /app/app.js ./app.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000
CMD ["node", "app.js"]
