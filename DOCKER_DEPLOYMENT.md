# Docker Deployment Guide

Deploy the entire Zetra application (Frontend + Backend + MongoDB) using Docker.

---

## Prerequisites

- Docker installed: https://docs.docker.com/get-docker/
- Docker Compose installed (included with Docker Desktop)

---

## Quick Start

### 1. Setup Environment Variables

Copy the example env file:
```bash
cp .env.docker .env
```

Edit `.env` and add your values:
```env
JWT_SECRET=your-random-secret-key-here
OPENAI_API_KEY=sk-or-v1-your-openrouter-key
```

### 2. Build and Run

```bash
docker-compose up --build
```

That's it! Your app is running:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000
- **MongoDB:** localhost:27017

---

## Docker Services

### 1. MongoDB (Database)
- **Port:** 27017
- **Container:** zetra-mongodb
- **Data:** Persisted in Docker volume

### 2. Backend (Node.js + Express + Socket.io)
- **Port:** 4000
- **Container:** zetra-backend
- **Health Check:** http://localhost:4000/health

### 3. Frontend (Next.js)
- **Port:** 3000
- **Container:** zetra-frontend
- **URL:** http://localhost:3000

---

## Docker Commands

### Start Services
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached)
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs (live)
docker-compose logs -f backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Check Status
```bash
docker-compose ps
```

---

## Production Deployment

### Option 1: Deploy to Any VPS (DigitalOcean, AWS EC2, etc.)

1. **SSH into your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Clone your repository:**
   ```bash
   git clone https://github.com/yourusername/webrtc_backend_zetra.git
   cd webrtc_backend_zetra
   ```

4. **Setup environment:**
   ```bash
   cp .env.docker .env
   nano .env  # Edit with your values
   ```

5. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

6. **Setup Nginx reverse proxy (optional):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

### Option 2: Deploy to Render (Docker)

1. **Create render.yaml:**
   ```yaml
   services:
     - type: web
       name: zetra-app
       env: docker
       dockerfilePath: ./Dockerfile
       plan: free
   ```

2. **Push to GitHub**

3. **Connect to Render**

---

### Option 3: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

---

## Environment Variables for Production

Update `.env` for production:

```env
# Production MongoDB (use MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zetra

# JWT Secret (generate strong random string)
JWT_SECRET=your-production-secret-key-very-long-and-random

# OpenRouter API Key
OPENAI_API_KEY=sk-or-v1-your-production-key

# Backend URL (your production domain)
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Check if port is in use
netstat -ano | findstr :4000  # Windows
lsof -i :4000                 # Mac/Linux
```

### Database connection failed
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:4000/health

# Check environment variable
docker-compose exec frontend env | grep NEXT_PUBLIC_API_BASE_URL

# Restart frontend
docker-compose restart frontend
```

### Rebuild after code changes
```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all
docker-compose up --build
```

---

## Development with Docker

### Hot Reload (Development Mode)

Create `docker-compose.dev.yml`:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    volumes:
      - ./server:/app/server
    command: npm run dev

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    volumes:
      - ./app:/app/app
      - ./components:/app/components
      - ./lib:/app/lib
    command: npm run dev
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

---

## Scaling

### Scale backend instances:
```bash
docker-compose up --scale backend=3
```

### Use load balancer (Nginx):
```nginx
upstream backend {
    server localhost:4000;
    server localhost:4001;
    server localhost:4002;
}
```

---

## Backup Database

### Backup:
```bash
docker-compose exec mongodb mongodump --out /data/backup
docker cp zetra-mongodb:/data/backup ./backup
```

### Restore:
```bash
docker cp ./backup zetra-mongodb:/data/backup
docker-compose exec mongodb mongorestore /data/backup
```

---

## Clean Up

### Remove all containers and volumes:
```bash
docker-compose down -v
```

### Remove all images:
```bash
docker-compose down --rmi all
```

### Remove everything (nuclear option):
```bash
docker system prune -a --volumes
```

---

## Cost Comparison

| Platform | Cost | Notes |
|----------|------|-------|
| **Local Docker** | Free | Development only |
| **DigitalOcean Droplet** | $6/month | 1GB RAM, 25GB SSD |
| **AWS EC2 t2.micro** | Free tier | 750 hours/month free |
| **Railway** | $5/month | Easy deployment |
| **Render** | Free | Spins down after 15 min |

---

## Success Checklist

- [ ] Docker and Docker Compose installed
- [ ] `.env` file created with correct values
- [ ] `docker-compose up` runs without errors
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend health check returns OK at http://localhost:4000/health
- [ ] Can create account and login
- [ ] Video calling works
- [ ] Database persists data after restart

---

## Next Steps

1. Test locally with Docker
2. Choose deployment platform
3. Setup production MongoDB (MongoDB Atlas recommended)
4. Deploy with `docker-compose up -d`
5. Setup domain and SSL certificate
6. Monitor with `docker-compose logs -f`

Your entire application is now containerized and ready to deploy anywhere! 🚀
