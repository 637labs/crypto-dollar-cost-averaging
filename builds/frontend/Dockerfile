FROM node:14.15.5 AS build-stage

################################## Frontend ##################################
WORKDIR /frontend

# Install dev dependencies
COPY package*.json ./
RUN npm install --production=false

# Bundle app source
COPY frontend ./app-src

# Build
COPY babel.config.json ./babel.config.json
RUN ./node_modules/.bin/babel --copy-files --extensions ".ts" ./app-src --out-dir ./app-lib
################################## Frontend ##################################

##################################  Client  ##################################
WORKDIR /client

# Install dev dependencies
COPY client/package*.json ./
RUN npm install --production=false

# Bundle app source
COPY client/src ./src
COPY client/public ./public

# Build
COPY client/tsconfig.json ./tsconfig.json
RUN ./node_modules/.bin/react-scripts build
##################################  Client  ##################################

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

# Add compiled frontend source
COPY --from=build-stage /frontend/app-lib ./frontend

# Add client build
COPY --from=build-stage /client/build ./client
ENV CLIENT_BUILD_PATH /usr/src/app/client

# Avoids issues with Content Security Policy by not bundling the JS with index.html page
ENV INLINE_RUNTIME_CHUNK=false

CMD [ "node", "frontend/server.js" ]
