#!/bin/bash

# HMK PWA - Database Setup Helper
# This script helps you set up PostgreSQL for the project

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}========================================"
echo -e "  PostgreSQL Database Setup"
echo -e "========================================${NC}"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo ""
    echo "Start PostgreSQL with:"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Option 1: Try to connect with password
echo -e "${YELLOW}Option 1: Connect with existing password${NC}"
echo "If you know your PostgreSQL password, enter it below:"
echo ""

read -sp "PostgreSQL password for user 'postgres': " db_password
echo ""

# Test connection
export PGPASSWORD="$db_password"
if psql -U postgres -h localhost -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection successful!${NC}"
    password_works=true
else
    echo -e "${RED}❌ Password incorrect or connection failed${NC}"
    password_works=false
fi

# If password doesn't work, offer to reset it
if [ "$password_works" != true ]; then
    echo ""
    echo -e "${YELLOW}Option 2: Reset PostgreSQL password${NC}"
    echo "You can reset the PostgreSQL password by running:"
    echo ""
    echo -e "${CYAN}sudo -u postgres psql${NC}"
    echo ""
    echo "Then in the psql prompt, run:"
    echo -e "${CYAN}ALTER USER postgres PASSWORD 'your_new_password';${NC}"
    echo ""
    read -p "Have you reset the password? (y/N): " password_reset
    if [[ "$password_reset" =~ ^[Yy]$ ]]; then
        read -sp "Enter the new password: " db_password
        echo ""
        export PGPASSWORD="$db_password"
        if psql -U postgres -h localhost -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Connection successful!${NC}"
            password_works=true
        else
            echo -e "${RED}❌ Still cannot connect. Please check your PostgreSQL setup.${NC}"
            exit 1
        fi
    else
        echo ""
        echo -e "${YELLOW}Option 3: Use a different PostgreSQL user${NC}"
        read -p "Enter PostgreSQL username: " db_user
        read -sp "Enter password: " db_password
        echo ""
        export PGPASSWORD="$db_password"
        if psql -U "$db_user" -h localhost -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Connection successful!${NC}"
            password_works=true
        else
            echo -e "${RED}❌ Cannot connect. Exiting.${NC}"
            exit 1
        fi
    fi
fi

# Now create database
echo ""
echo -e "${CYAN}🗄️  Setting up database...${NC}"

db_name="hmk_pwa"

# Check if database exists
if psql -U postgres -h localhost -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
    echo -e "${YELLOW}⚠️  Database '$db_name' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " recreate_db
    if [[ "$recreate_db" =~ ^[Yy]$ ]]; then
        psql -U postgres -h localhost -d postgres -c "DROP DATABASE IF EXISTS $db_name;" > /dev/null 2>&1
        echo -e "${GREEN}✅ Old database dropped${NC}"
    fi
fi

# Create database if it doesn't exist
if ! psql -U postgres -h localhost -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
    psql -U postgres -h localhost -d postgres -c "CREATE DATABASE $db_name;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database '$db_name' created!${NC}"
    else
        echo -e "${RED}❌ Failed to create database${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Database '$db_name' exists${NC}"
fi

# Update .env.local
echo ""
echo -e "${CYAN}📝 Updating .env.local...${NC}"

database_url="postgresql://postgres:${db_password}@localhost:5432/${db_name}"

# Backup existing .env.local
cp .env.local .env.local.backup 2>/dev/null || true

# Update DATABASE_URL in .env.local
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$database_url\"|" .env.local
else
    # Linux
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$database_url\"|" .env.local
fi

echo -e "${GREEN}✅ .env.local updated!${NC}"

# Run migrations
echo ""
echo -e "${CYAN}🗄️  Running database migrations...${NC}"
export DATABASE_URL="$database_url"
npx prisma migrate dev --name init

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed!${NC}"
else
    echo -e "${YELLOW}⚠️  Migration had issues, but you can try running it manually:${NC}"
    echo "  npx prisma migrate dev"
fi

echo ""
echo -e "${CYAN}========================================"
echo -e "  Setup Complete! 🎉"
echo -e "========================================${NC}"
echo ""
echo -e "${GREEN}✅ Database configured${NC}"
echo -e "${GREEN}✅ .env.local updated${NC}"
echo ""
echo -e "${YELLOW}Next step: Start the development server${NC}"
echo "  npm run dev"
echo ""
