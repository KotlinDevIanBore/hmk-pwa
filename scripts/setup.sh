#!/bin/bash

# HMK PWA - Quick Setup Script (Unix/Mac/Linux)
# This script automates the initial setup process

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================"
echo -e "  HMK PWA - Quick Setup Script"
echo -e "========================================${NC}"
echo ""

# Function to generate JWT secret
generate_jwt_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    elif command -v node &> /dev/null; then
        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    else
        echo "Error: Neither openssl nor node.js found. Please install one of them."
        exit 1
    fi
}

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local file already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Keeping existing .env.local file${NC}"
        skip_env=true
    else
        skip_env=false
    fi
else
    skip_env=false
fi

# Create .env.local if needed
if [ "$skip_env" != true ]; then
    echo ""
    echo -e "${CYAN}📝 Creating .env.local file...${NC}"
    echo ""
    
    # Get database configuration
    echo -e "${YELLOW}Database Configuration:${NC}"
    read -p "Database host (default: localhost): " db_host
    db_host=${db_host:-localhost}
    
    read -p "Database port (default: 5432): " db_port
    db_port=${db_port:-5432}
    
    read -p "Database username (default: postgres): " db_user
    db_user=${db_user:-postgres}
    
    read -sp "Database password: " db_password
    echo ""
    
    read -p "Database name (default: hmk_pwa): " db_name
    db_name=${db_name:-hmk_pwa}
    
    # Generate JWT secret
    echo ""
    echo -e "${CYAN}🔐 Generating JWT secret...${NC}"
    jwt_secret=$(generate_jwt_secret)
    
    # Create DATABASE_URL
    database_url="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}"
    
    # Create .env.local file
    cat > .env.local << EOF
# Database Configuration
DATABASE_URL="${database_url}"

# JWT Configuration
JWT_SECRET="${jwt_secret}"
JWT_EXPIRES_IN="7d"

# OTP Configuration
OTP_EXPIRY_MINUTES="5"

# Rate Limiting
RATE_LIMIT_MAX="5"
RATE_LIMIT_WINDOW_MS="900000"

# Security
BCRYPT_ROUNDS="10"

# Environment
NODE_ENV="development"
EOF
    
    echo -e "${GREEN}✅ .env.local file created successfully!${NC}"
    echo ""
fi

# Install dependencies
echo ""
echo -e "${CYAN}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed!${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Generate Prisma Client
echo ""
echo -e "${CYAN}🔨 Generating Prisma Client...${NC}"
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prisma Client generated!${NC}"

# Test database connection
echo ""
echo -e "${CYAN}🔌 Testing database connection...${NC}"
read -p "Do you want to test the database connection? (Y/n): " test_connection
if [[ ! "$test_connection" =~ ^[Nn]$ ]]; then
    # Try to connect to database
    if npx prisma db execute --schema prisma/schema.prisma --stdin <<< "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✅ Database connection successful!${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not connect to database${NC}"
        echo -e "${YELLOW}Please ensure PostgreSQL is running and credentials are correct${NC}"
    fi
fi

# Run migrations
echo ""
echo -e "${CYAN}🗄️  Database Migrations${NC}"
read -p "Do you want to run database migrations now? (Y/n): " run_migrations
if [[ ! "$run_migrations" =~ ^[Nn]$ ]]; then
    echo "Running migrations..."
    npm run prisma:migrate
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migrations completed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration failed - you can run 'npm run prisma:migrate' manually later${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped migrations - run 'npm run prisma:migrate' when ready${NC}"
fi

# Seed database
echo ""
echo -e "${CYAN}🌱 Database Seeding${NC}"
read -p "Do you want to seed the database with sample data? (y/N): " run_seed
if [[ "$run_seed" =~ ^[Yy]$ ]]; then
    echo "Seeding database..."
    npm run prisma:seed
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database seeded successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Seeding failed - you can run 'npm run prisma:seed' manually later${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped seeding${NC}"
fi

# Run tests
echo ""
echo -e "${CYAN}🧪 Running Tests${NC}"
read -p "Do you want to run the test suite? (Y/n): " run_tests
if [[ ! "$run_tests" =~ ^[Nn]$ ]]; then
    echo "Running unit tests..."
    npm run test
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Some tests failed - check the output above${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped tests${NC}"
fi

# Summary
echo ""
echo -e "${CYAN}========================================"
echo -e "  Setup Complete! 🎉"
echo -e "========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${NC}1. Review your .env.local file"
echo -e "2. Start the development server: npm run dev"
echo -e "3. Open http://localhost:3000 in your browser${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "${NC}- npm run dev          Start development server"
echo -e "- npm run build        Build for production"
echo -e "- npm run test         Run unit tests"
echo -e "- npm run test:e2e     Run E2E tests"
echo -e "- npm run lint         Run linter"
echo -e "- npm run prisma:studio Open Prisma Studio (database GUI)${NC}"
echo ""

# Ask to start dev server
read -p "Do you want to start the development server now? (Y/n): " start_dev
if [[ ! "$start_dev" =~ ^[Nn]$ ]]; then
    echo ""
    echo -e "${CYAN}🚀 Starting development server...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    npm run dev
else
    echo ""
    echo -e "${GREEN}Run 'npm run dev' when you're ready to start!${NC}"
    echo ""
fi

