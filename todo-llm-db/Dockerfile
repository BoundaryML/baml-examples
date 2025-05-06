# Install dependencies only when needed
FROM node:20-bookworm AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.

# RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm ci
RUN npm install @boundaryml/baml@0.86 @boundaryml/baml-nextjs-plugin
RUN npm install lightningcss
RUN npm install tailwindcss
RUN npm install @tailwindcss/oxide-linux-x64-gnu
RUN npm install @next/font
RUN pwd
RUN ls node_modules/@boundaryml
RUN ls node_modules/@boundaryml/baml
# RUN ls node_modules/@boundaryml/baml-linux-x64-musl
RUN npx baml-cli generate

ENV NEXT_TELEMETRY_DISABLED=1

# Add `ARG` instructions below if you need `NEXT_PUBLIC_` variables
# then put the value on your fly.toml
# Example:
# ARG NEXT_PUBLIC_EXAMPLE="value here"

RUN npm run build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:20-bookworm AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app ./

USER nextjs

ENV PORT=8080
CMD ["npm", "run", "start"]

# If using npm comment out above and use below instead
# CMD ["npm", "run", "start"]
