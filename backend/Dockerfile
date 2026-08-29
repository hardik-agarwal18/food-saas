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

EXPOSE 3000

CMD ["npm", "run", "dev"]

#######################
# STAGE-4 BUILD PHASE #
#######################

