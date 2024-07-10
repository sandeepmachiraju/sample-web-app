# Use Node.js base image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose default HTTPS port
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
