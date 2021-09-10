FROM node:fermium-buster-slim

EXPOSE 3000/tcp

# unzip bundle
COPY ./builds/app.tar.gz /bundle.tar.gz
RUN tar -xf bundle.tar.gz
RUN rm bundle.tar.gz

# install npm packages
WORKDIR /bundle/programs/server
RUN npm install --save
RUN npm run install

# start app
WORKDIR /bundle
CMD ["node", "main.js"]
