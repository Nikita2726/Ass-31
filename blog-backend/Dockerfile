# Use official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the app
CMD ["node", "server.js"]