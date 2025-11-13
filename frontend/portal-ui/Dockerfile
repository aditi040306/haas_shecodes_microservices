# ---- build stage ----
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build-time API bases (injected by docker compose args)
ARG REACT_APP_USER_URL
ARG REACT_APP_PROJECT_URL
ARG REACT_APP_INVENTORY_URL
ENV REACT_APP_USER_URL=$REACT_APP_USER_URL
ENV REACT_APP_PROJECT_URL=$REACT_APP_PROJECT_URL
ENV REACT_APP_INVENTORY_URL=$REACT_APP_INVENTORY_URL

COPY . .
RUN npm run build

# ---- serve stage ----
FROM nginx:alpine

# Optional: custom SPA routing if you have it
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled app from build stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
