# Use Node.js slim image
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY src/ ./src/
COPY shared/ ./shared/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3100

# Create non-root user
RUN groupadd -r mwap && \
    useradd -r -g mwap mwap && \
    chown -R mwap:mwap /usr/src/app

# Switch to non-root user
USER mwap

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3100/health || exit 1

# Expose port
EXPOSE 3100

# Start application
CMD ["node", "src/app.js"]