FROM --platform=linux/arm64 node:current
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
CMD ["npm", "run", "dev"]