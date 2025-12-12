# Quick Reference Guide

## 🚀 Common Commands

### Development
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm start                # Start production server
```

### Database
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:seed      # Seed database with sample data
```

### Testing
```bash
npm test                 # Run unit tests
npm run test:ui          # Run unit tests with UI
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
```

### Code Quality
```bash
npm run lint             # Run ESLint
npx tsc --noEmit         # TypeScript type check
```

---

## 📂 Key Directories

```
├── app/                 # Next.js App Router
│   └── [locale]/        # Internationalized pages
├── components/          # React components
│   └── ui/              # shadcn/ui components
├── contexts/            # React contexts
├── lib/                 # Utilities and configs
├── messages/            # i18n translations
├── prisma/              # Database schema & migrations
├── public/              # Static assets
├── tests/               # Test files
│   ├── e2e/             # End-to-end tests
│   └── unit/            # Unit tests
└── types/               # TypeScript definitions
```

---

## 🔧 Configuration Files

- `package.json` - Dependencies & scripts
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS
- `tsconfig.json` - TypeScript
- `eslint.config.mjs` - ESLint
- `prisma/schema.prisma` - Database schema
- `.cursorrules` - Development standards

---

## 🌐 URLs

- **App:** http://localhost:3000
- **English:** http://localhost:3000/en
- **Swahili:** http://localhost:3000/sw
- **Prisma Studio:** http://localhost:5555

---

## 👤 Sample Users (Development)

### Admin
- Email: admin@hmk.org
- Password: admin123

### PWD User
- Phone: 0712345678
- PIN: 1234

### Caregiver
- Phone: 0734567890
- PIN: 1234

---

## 🎨 Accessibility Shortcuts

- **Tab** - Navigate through interactive elements
- **Enter/Space** - Activate buttons and links
- **Esc** - Close dialogs and menus

---

## 🐛 Quick Fixes

### Clear everything and reinstall
```bash
rm -rf node_modules .next
rm package-lock.json
npm install
```

### Reset database
```bash
npx prisma migrate reset
```

### Regenerate Prisma client
```bash
npm run prisma:generate
```

### Kill process on port 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 📝 Git Commit Format

```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
chore: update dependencies
style: format code
refactor: restructure code
```

---

## 🧪 Testing Checklist

- [ ] Homepage loads
- [ ] Language switcher works
- [ ] Font size adjustment works
- [ ] High contrast mode works
- [ ] Keyboard navigation works
- [ ] Database connection works
- [ ] All tests pass

---

## 📞 Database Connection String

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Example:
```
postgresql://postgres:postgres@localhost:5432/hmk_pwa?schema=public
```

---

## 🔍 Useful Prisma Commands

```bash
npx prisma studio              # Open database GUI
npx prisma db push             # Push schema changes (dev only)
npx prisma migrate dev         # Create new migration
npx prisma migrate reset       # Reset database (⚠️ deletes data)
npx prisma generate            # Generate Prisma Client
npx prisma format              # Format schema file
npx prisma validate            # Validate schema
```

---

## 📚 Documentation Files

1. `SETUP_INSTRUCTIONS.md` - Full setup guide
2. `README_PHASE1.md` - Phase 1 overview
3. `PHASE1_COMPLETION_SUMMARY.md` - Completion details
4. `QUICK_REFERENCE.md` - This file
5. `.cursorrules` - Development standards

---

## 🎯 Next Steps After Setup

1. ✅ Install Node.js 18+
2. ✅ Install PostgreSQL 14+
3. ✅ Run `npm install`
4. ✅ Configure `.env.local`
5. ✅ Run `npm run prisma:migrate`
6. ✅ Run `npm run prisma:seed`
7. ✅ Run `npm run dev`
8. ✅ Open http://localhost:3000/en
9. ✅ Test accessibility features
10. ✅ Run tests: `npm test`

---

## ⚡ Pro Tips

- Use `Prisma Studio` for easy database viewing
- Check `DevTools → Application` for PWA status
- Use `Tab` key to test keyboard navigation
- Test both `/en` and `/sw` routes
- Check console for errors (F12)
- Test on mobile viewport
- Try high contrast mode for accessibility
- Use screen reader to test announcements

---

## 🆘 Getting Help

1. Check `SETUP_INSTRUCTIONS.md` for detailed setup
2. Review `PHASE1_COMPLETION_SUMMARY.md` for what's implemented
3. Read `.cursorrules` for development standards
4. Check error messages in terminal
5. Look at sample code in test files
6. Review Prisma schema for database structure

---

**Quick Start:** `npm install` → `npm run prisma:migrate` → `npm run dev` ✨


