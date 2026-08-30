######################
# STAGE-1 BASE PHASE #
######################

FROM node:22-alpine AS base

WORKDIR /app

#########################################
# STAGE-2 DEPENDENCY INSTALLATION PHASE #
#########################################

FROM base AS dependencies

COPY package*.json ./

RUN npm ci 

##############################
# STAGE-3 DEVELOPMENT PHASE  #
##############################

FROM base AS development

# Set development environment variable
ENV NODE_ENV=development

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]

#######################
# STAGE-4 BUILD PHASE #
#######################

FROM base AS build

ENV NODE_ENV=development

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

RUN npm run db:generate

RUN npm run build

#########################################
# STAGE-5 PRODUCTION DEPENDENCIES PHASE #
#########################################

FROM base AS production-dependencies

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

#############################
# STAGE-6 PRODUCTION PHASE  #
#############################

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S nodejs && \
    adduser -S nodejs -G nodejs

COPY --from=production-dependencies /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist

COPY package*.json ./

USER nodejs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main.js"]