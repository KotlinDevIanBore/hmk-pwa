# Git Setup Instructions

## Prerequisites

Git is not currently installed on your system. Please install Git first:

### Windows Installation

1. **Download Git for Windows:**
   - Visit: https://git-scm.com/download/win
   - Download the latest version
   - Run the installer

2. **Installation Options (Recommended):**
   - Use Visual Studio Code as Git's default editor (or your preferred editor)
   - Override the default branch name: `main`
   - Git from the command line and also from 3rd-party software
   - Use bundled OpenSSH
   - Use the native Windows Secure Channel library
   - Checkout Windows-style, commit Unix-style line endings
   - Use Windows' default console window
   - Default (fast-forward or merge)
   - Git Credential Manager
   - Enable file system caching
   - Enable symbolic links

3. **Verify Installation:**
   ```bash
   git --version
   ```

## After Installing Git

Once Git is installed, run these commands in the project directory:

### 1. Initialize Repository

```bash
# Navigate to project directory
cd "D:\HMK  - PWA"

# Initialize git repository
git init

# Set default branch to main
git branch -M main
```

### 2. Configure Git (First Time Only)

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main
```

### 3. Make Initial Commit

```bash
# Add all files to staging
git add .

# Create initial commit
git commit -m "feat: initial project setup with presentation and development plan"
```

### 4. View Status

```bash
# Check repository status
git status

# View commit history
git log --oneline
```

## Quick Reference - Git Commands

### Daily Workflow

```bash
# Check status
git status

# Stage changes
git add .                    # Add all changes
git add <file>              # Add specific file

# Commit changes
git commit -m "type: description"

# View history
git log --oneline
git log --graph --oneline --all
```

### Conventional Commits

This project uses conventional commits. Format:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, semicolons, etc)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

**Examples:**

```bash
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve OTP validation error"
git commit -m "docs: update API documentation"
git commit -m "style: format code with prettier"
git commit -m "refactor: optimize database queries"
git commit -m "test: add unit tests for auth service"
git commit -m "chore: update dependencies"
```

### Branching

```bash
# Create new branch
git branch feature/appointment-booking

# Switch to branch
git checkout feature/appointment-booking

# Create and switch (shortcut)
git checkout -b feature/sms-system

# List branches
git branch

# Merge branch into main
git checkout main
git merge feature/appointment-booking

# Delete branch
git branch -d feature/appointment-booking
```

### Remote Repository (When Ready)

```bash
# Add remote repository
git remote add origin <repository-url>

# Push to remote
git push -u origin main

# Pull from remote
git pull origin main

# View remotes
git remote -v
```

## Recommended Workflow

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/user-dashboard

# 2. Make changes and commit regularly
git add .
git commit -m "feat: add user dashboard layout"

# 3. More changes
git add .
git commit -m "feat: add dashboard navigation"

# 4. Switch back to main
git checkout main

# 5. Merge feature
git merge feature/user-dashboard

# 6. Delete feature branch
git branch -d feature/user-dashboard
```

### Bug Fixes

```bash
# 1. Create bugfix branch
git checkout -b fix/login-error

# 2. Fix the bug
git add .
git commit -m "fix: resolve login validation error"

# 3. Merge to main
git checkout main
git merge fix/login-error

# 4. Delete branch
git branch -d fix/login-error
```

## Git Ignore

The `.gitignore` file is already configured to exclude:
- `node_modules/`
- `.env` files
- Build directories (`.next/`, `out/`, `build/`)
- IDE settings
- System files
- Database files
- Logs

## Troubleshooting

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### Discard All Local Changes
```bash
git restore .
```

### View Changes Before Commit
```bash
git diff
```

### View Staged Changes
```bash
git diff --staged
```

## Best Practices

1. **Commit Often:** Small, focused commits are better than large ones
2. **Write Clear Messages:** Use conventional commit format
3. **Review Before Commit:** Use `git status` and `git diff`
4. **Branch for Features:** Create branches for new features
5. **Keep Main Clean:** Only merge tested, working code
6. **Pull Before Push:** Always pull latest changes before pushing
7. **Don't Commit Secrets:** Never commit API keys, passwords, etc.

## Next Steps

1. Install Git (see instructions above)
2. Configure your name and email
3. Run the initialization commands
4. Start developing with proper version control!

---

**Note:** Once you've initialized the repository, this file will also be tracked by Git. You can keep it for reference or remove it later.

