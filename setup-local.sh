#!/bin/bash

# HMK PWA - Local Setup Helper Script
# This script helps you configure and run the project locally

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================"
echo -e "  HMK PWA - Local Setup"
echo -e "========================================${NC}"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local file not found!${NC}"
    exit 1
fi

# Function to test database connection
test_db_connection() {
    local db_url=$1
    export DATABASE_URL="$db_url"
    if npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Get database credentials
echo -e "${YELLOW}📝 Database Configuration${NC}"
echo "Please provide your PostgreSQL credentials:"
echo ""

read -p "PostgreSQL username (default: postgres): " db_user
db_user=${db_user:-postgres}

read -sp "PostgreSQL password: " db_password
echo ""

read -p "PostgreSQL host (default: localhost): " db_host
db_host=${db_host:-localhost}

read -p "PostgreSQL port (default: 5432): " db_port
db_port=${db_port:-5432}

read -p "Database name (default: hmk_pwa): " db_name
db_name=${db_name:-hmk_pwa}

# Create DATABASE_URL
database_url="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}"

echo ""
echo -e "${CYAN}🔌 Testing database connection...${NC}"

# Test connection
if test_db_connection "$database_url"; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${RED}❌ Database connection failed!${NC}"
    echo ""
    echo -e "${YELLOW}Possible issues:${NC}"
    echo "1. PostgreSQL is not running"
    echo "2. Wrong username/password"
    echo "3. Database '$db_name' doesn't exist"
    echo ""
    read -p "Do you want to try creating the database? (y/N): " create_db
    if [[ "$create_db" =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${CYAN}Creating database...${NC}"
        PGPASSWORD="$db_password" psql -h "$db_host" -p "$db_port" -U "$db_user" -d postgres -c "CREATE DATABASE $db_name;" 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database created!${NC}"
        else
            echo -e "${RED}❌ Failed to create database. Please create it manually:${NC}"
            echo "  psql -U $db_user -c \"CREATE DATABASE $db_name;\""
            exit 1
        fi
    else
        exit 1
    fi
fi

# Update .env.local
echo ""
echo -e "${CYAN}📝 Updating .env.local...${NC}"

# Backup existing .env.local
cp .env.local .env.local.backup

# Update DATABASE_URL in .env.local
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$database_url\"|" .env.local
else
    # Linux
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$database_url\"|" .env.local
fi

echo -e "${GREEN}✅ .env.local updated!${NC}"

# Generate Prisma Client
echo ""
echo -e "${CYAN}🔨 Generating Prisma Client...${NC}"
export DATABASE_URL="$database_url"
npm run prisma:generate
echo -e "${GREEN}✅ Prisma Client generated!${NC}"

# Run migrations
echo ""
echo -e "${CYAN}🗄️  Running database migrations...${NC}"
npx prisma migrate dev --name init
echo -e "${GREEN}✅ Migrations completed!${NC}"

# Summary
echo ""
echo -e "${CYAN}========================================"
echo -e "  Setup Complete! 🎉"
echo -e "========================================${NC}"
echo ""
echo -e "${GREEN}✅ Database configured and migrations applied${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Start the development server: ${CYAN}npm run dev${NC}"
echo "2. Open http://localhost:3000 in your browser"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "- npm run dev          Start development server"
echo "- npm run prisma:studio Open Prisma Studio (database GUI)"
echo "- npm run test         Run tests"
echo ""

read -p "Do you want to start the development server now? (Y/n): " start_dev
if [[ ! "$start_dev" =~ ^[Nn]$ ]]; then
    echo ""
    echo -e "${CYAN}🚀 Starting development server...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    npm run dev
fi
