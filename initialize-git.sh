#!/bin/bash

# Git Initialization Script for Hope Mobility Kenya PWA
# Run this after installing Git (for Mac/Linux)

echo "============================================"
echo "Hope Mobility Kenya PWA - Git Setup"
echo "============================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed!"
    echo ""
    echo "Please install Git first:"
    echo "  Mac:   brew install git"
    echo "  Linux: sudo apt-get install git"
    echo ""
    exit 1
fi

echo "Git is installed: $(git --version)"
echo ""

# Initialize repository
echo "Initializing Git repository..."
if ! git init; then
    echo "ERROR: Failed to initialize repository"
    exit 1
fi
echo "✓ Repository initialized"
echo ""

# Set default branch to main
echo "Setting default branch to 'main'..."
git branch -M main
echo "✓ Default branch set"
echo ""

# Check if user is configured
if ! git config user.name &> /dev/null; then
    echo ""
    echo "NOTE: Git user not configured globally."
    echo "You may want to set your name and email:"
    echo "  git config --global user.name \"Your Name\""
    echo "  git config --global user.email \"your.email@example.com\""
    echo ""
fi

# Stage all files
echo "Staging all files..."
if ! git add .; then
    echo "ERROR: Failed to stage files"
    exit 1
fi
echo "✓ Files staged"
echo ""

# Create initial commit
echo "Creating initial commit..."
if ! git commit -m "feat: initial project setup with presentation and development plan"; then
    echo "ERROR: Failed to create commit"
    echo ""
    echo "This might be because Git user is not configured."
    echo "Please run:"
    echo "  git config user.name \"Your Name\""
    echo "  git config user.email \"your.email@example.com\""
    echo ""
    echo "Then run:"
    echo "  git commit -m \"feat: initial project setup with presentation and development plan\""
    echo ""
    exit 1
fi
echo "✓ Initial commit created"
echo ""

# Show status
echo "Current repository status:"
echo ""
git status
echo ""

echo "============================================"
echo "Git setup complete!"
echo "============================================"
echo ""
echo "Your repository has been initialized with:"
echo "  - Branch: main"
echo "  - Initial commit with all project files"
echo ""
echo "View commit history:"
echo "  git log --oneline"
echo ""
echo "Next steps:"
echo "  1. Connect to remote repository (when ready):"
echo "     git remote add origin [repository-url]"
echo "     git push -u origin main"
echo ""
echo "  2. Start developing:"
echo "     git checkout -b feature/your-feature-name"
echo ""
echo "See SETUP_GIT.md for more information."
echo ""

