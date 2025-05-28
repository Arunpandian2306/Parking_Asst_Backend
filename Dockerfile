# Use official Node 22 image
FROM node:22.16.0

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set the ownership of the application files to the node user
RUN chown -R node:node /usr/src/app

# Switch to the node user
USER node

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
