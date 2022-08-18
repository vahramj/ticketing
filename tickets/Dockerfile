FROM node:alpine 

WORKDIR /app
COPY package.json .
# this will make sure dev-dependences in package.json are not installed 
# regardless of NODE_ENV value
RUN npm install --only=prod
COPY . .

CMD ["npm", "start"]