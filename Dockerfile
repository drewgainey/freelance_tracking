# Step 1: Use the official Node.js image as the base image
FROM node:16-alpine as build

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install
# Step 5: Copy the rest of your application's code
COPY . .

# Step 6: Build your application
RUN npm run build

# Step 7: Use Nginx to serve the application
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Step 8: Expose port 80
EXPOSE 80

# Step 9: Run Nginx
CMD ["nginx", "-g", "daemon off;"]
