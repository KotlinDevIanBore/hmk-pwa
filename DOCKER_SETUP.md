# Docker PostgreSQL Setup Guide

This guide explains how to run PostgreSQL in Docker for local development.

## 🚀 Quick Start

### 1. Start PostgreSQL Container

```bash
cd /home/ian/Desktop/hmk/hmk-pwa
docker-compose up -d
```

This will:
- Pull PostgreSQL 16 image (if not already present)
- Create a container named `hmk-postgres`
- Create a persistent volume for data
- Expose PostgreSQL on `localhost:5432`

### 2. Verify Container is Running

```bash
docker-compose ps
```

You should see the `hmk-postgres` container running.

### 3. Check Logs (if needed)

```bash
docker-compose logs postgres
```

### 4. Update .env.local

Update your `.env.local` file with the Docker PostgreSQL credentials:

```env
DATABASE_URL="postgresql://hmk_user:hmk_password@localhost:5432/hmk_pwa"
```

### 5. Test Prisma Connection

```bash
# Generate Prisma Client
npm run prisma:generate

# Test database connection
npx prisma db pull

# Run migrations
npx prisma migrate dev
```

## 📋 Docker Credentials

- **User**: `hmk_user`
- **Password**: `hmk_password`
- **Database**: `hmk_pwa`
- **Host**: `localhost`
- **Port**: `5432`

## 🛠️ Useful Commands

### Start/Stop Container

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL (keeps data)
docker-compose stop

# Stop and remove container (keeps data)
docker-compose down

# Stop and remove container + volumes (⚠️ DELETES DATA)
docker-compose down -v
```

### Access PostgreSQL CLI

```bash
# Connect to database
docker-compose exec postgres psql -U hmk_user -d hmk_pwa

# Or using psql from host (if installed)
psql -h localhost -U hmk_user -d hmk_pwa
# Password: hmk_password
```

### View Database

```bash
# Using Prisma Studio
npm run prisma:studio
```

### Reset Database (if needed)

```bash
# Stop container
docker-compose down

# Remove volume (⚠️ DELETES ALL DATA)
docker-compose down -v

# Start fresh
docker-compose up -d

# Run migrations
npx prisma migrate dev
```

## 🔍 Troubleshooting

### Port 5432 Already in Use

If you have a system PostgreSQL running:

```bash
# Stop system PostgreSQL
sudo systemctl stop postgresql

# Or change port in docker-compose.yml:
# ports:
#   - "5433:5432"
# Then update DATABASE_URL to use port 5433
```

### Container Won't Start

```bash
# Check logs
docker-compose logs postgres

# Check if port is available
lsof -i :5432

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Connection Refused

1. Verify container is running: `docker-compose ps`
2. Check health status: `docker-compose ps` should show "healthy"
3. Verify DATABASE_URL in `.env.local`
4. Test connection: `npx prisma db pull`

### Permission Issues

If you get permission errors:

```bash
# Check Docker is running
docker ps

# Check container logs
docker-compose logs postgres
```

## 📦 Data Persistence

The database data is stored in a Docker volume named `postgres_data`. This means:

- ✅ Data persists when you stop/restart the container
- ✅ Data persists when you restart your computer
- ⚠️ Data is deleted only if you run `docker-compose down -v`

To backup your data:

```bash
# Create backup
docker-compose exec postgres pg_dump -U hmk_user hmk_pwa > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U hmk_user hmk_pwa < backup.sql
```

## 🔄 Migration from System PostgreSQL

If you were using system PostgreSQL before:

1. **Stop system PostgreSQL** (optional, to free port 5432):
   ```bash
   sudo systemctl stop postgresql
   ```

2. **Start Docker PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

3. **Update .env.local** with Docker credentials

4. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Verify**:
   ```bash
   npm run prisma:studio
   ```

## ✅ Verification Checklist

- [ ] Docker is installed and running
- [ ] `docker-compose up -d` succeeds
- [ ] Container shows as "healthy" in `docker-compose ps`
- [ ] `.env.local` has correct `DATABASE_URL`
- [ ] `npx prisma db pull` works
- [ ] `npx prisma migrate dev` works
- [ ] `npm run prisma:studio` opens successfully

## 🎯 Next Steps

Once PostgreSQL is running in Docker:

1. Update `.env.local` with Docker credentials
2. Run `npx prisma migrate dev` to set up the database
3. Start your Next.js app: `npm run dev`
4. Your backend API will connect to the Docker PostgreSQL instance

---

**Note**: The Next.js app itself is NOT dockerized yet - only PostgreSQL runs in Docker. This is perfect for local development!
