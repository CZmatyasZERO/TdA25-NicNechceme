# Use the official Node.js image as a base image
FROM node:23

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Set environment variables
ENV NODE_ENV production
ENV PASSWORD_HASH_COMPLEXITY 10
ENV SECRET_SESSION_PASSWORD aiECWSi8zCVMhgdSrsA5610OaskX4uXS

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
