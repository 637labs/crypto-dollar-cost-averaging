FROM node:14.15.5 AS build-stage

# Install dev dependencies
COPY package*.json ./
RUN npm install --production=false

# Bundle app source
COPY frontend /app-src

# Build
COPY babel.config.json ./babel.config.json
RUN ./node_modules/.bin/babel --copy-files --extensions ".ts" /app-src --out-dir /app-lib

FROM node:14.15.5

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --production
# If you are building your code for production
# RUN npm ci --only=production

# Add compiled app source
COPY --from=build-stage /app-lib ./frontend

EXPOSE 3000

CMD [ "node", "frontend/server.js" ]
