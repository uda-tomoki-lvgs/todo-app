FROM --platform=linux/arm64 node:23.6.1
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
CMD ["npm", "run", "dev"]