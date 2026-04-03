FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Show what was built (for debugging)
RUN echo "=== Build output ===" && \
    find /app/dist -name "index.html" -exec dirname {} \; 2>/dev/null | head -1

FROM nginx:alpine
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Strategy: Copy everything from dist, then find the actual app files
COPY --from=build /app/dist /tmp/dist

# Find where index.html actually is and copy from there
RUN ACTUAL_PATH=$(find /tmp/dist -name "index.html" -exec dirname {} \; | head -1) && \
    echo "Found build output at: $ACTUAL_PATH" && \
    cp -r $ACTUAL_PATH/* /usr/share/nginx/html/ && \
    rm -rf /tmp/dist

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
