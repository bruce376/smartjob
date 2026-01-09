FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Set environment to production
ENV NODE_ENV production

# Expose the port the app will run on
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
