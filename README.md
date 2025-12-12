# Hope Mobility Kenya - Progressive Web Application

> Empowering Persons with Disabilities through Technology

## 📋 Project Overview

Hope Mobility Kenya (HMK) is a comprehensive Progressive Web Application designed to provide accessibility services, mobility device distribution, and spiritual support to Persons with Disabilities (PWDs) in Kenya.

### Key Features

- 📱 **Phone + PIN + OTP Authentication** - Secure, accessible login system
- 👤 **Dual Registration** - Self-registration for PWDs and caregiver-assisted registration
- 🛠️ **Service Request System** - Operational and spiritual services
- 📅 **Smart Appointment Booking** - Resource center and outreach location support
- ♿ **Mobility Device Catalog** - Browse and request assistive devices
- 💬 **SMS Notifications** - Automated confirmations and updates
- 📊 **Admin Dashboard** - Complete management system
- 🌐 **Offline Support** - Full PWA capabilities
- ♿ **Accessibility First** - WCAG 2.1 AA compliant
- 🌍 **Multilingual** - English and Swahili support

## 🎨 Brand Identity

- **Primary Blue:** `#0056A6`
- **Warm Yellow/Cream:** `#F5E6B3`
- **Action Red:** `#DC143C`
- **Dark Gray:** `#3D3D3D`

## 🛠️ Technology Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components

### Backend
- Next.js API Routes
- PostgreSQL
- Prisma ORM

### Features
- next-pwa (Progressive Web App)
- next-intl (Internationalization)
- Vitest (Unit Testing)
- Playwright (E2E Testing)

### Tools
- pnpm (Package Manager)
- ESLint 9 (Linting)
- Git (Version Control)

## 📂 Project Structure

```
HMK-PWA/
├── presentation/          # Client presentation mockups
│   ├── index.html        # Main presentation file
│   ├── styles.css        # Presentation styles
│   ├── script.js         # Navigation logic
│   └── README.md         # Presentation documentation
├── HMK_PWA_Development_Plan.md  # Complete development plan
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm 8+
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd HMK-PWA

# Install dependencies (when project is initialized)
pnpm install

# Setup database
# Configure .env file with database credentials
# Run migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

## 📊 Development Plan

The project follows a comprehensive 20-phase development plan:

1. **Phase 1-5:** Foundation & Core Features
2. **Phase 6-9:** User Features & Services
3. **Phase 10-14:** Admin Platform & Management
4. **Phase 15-17:** Optimization & Testing
5. **Phase 18-20:** Launch & Support

See `HMK_PWA_Development_Plan.md` for complete details.

## 🎯 Success Metrics

- ♿ **Accessibility:** WCAG 2.1 AA compliance
- ⚡ **Performance:** Lighthouse score 90+
- 📱 **PWA:** Lighthouse PWA score 100
- 🧪 **Testing:** 80%+ code coverage
- 👥 **Capacity:** 12,000 concurrent users
- ⏱️ **Load Time:** <3s on slow 3G

## 📱 Client Presentation

A professional presentation mockup is available in the `presentation/` directory:

1. Open `presentation/index.html` in a browser
2. Navigate using arrow keys or on-screen controls
3. Export to PDF using the print function

See `presentation/README.md` for detailed instructions.

## 🌟 Features Breakdown

### User Features
- Self and caregiver registration
- Phone + PIN + OTP authentication
- Disability assessment questionnaire
- Mobility device catalog browsing
- Appointment booking (Resource Center & Outreach)
- Order tracking with status updates
- Feedback system (ratings + text)
- Profile management

### Admin Features
- Analytics dashboard with charts
- Appointment management
- Bulk SMS with templates
- User account management
- Product catalog management
- Report generation (PDF/Excel)
- Role-based access control
- SMS delivery tracking

### Accessibility Features
- Font size control (3 levels)
- High contrast mode
- Full keyboard navigation
- Screen reader optimized
- ARIA labels and landmarks
- Skip to content links
- Focus management

### PWA Features
- Installable on all devices
- Offline functionality
- Background sync
- Push notifications
- Cached assets
- Service worker

## 🔒 Security Features

- Bcrypt password hashing
- JWT token authentication
- Rate limiting on sensitive endpoints
- CSRF protection
- Secure session cookies
- SQL injection prevention
- XSS protection

## 🌍 Internationalization

- English (default)
- Kiswahili
- Easy addition of more languages
- RTL support ready

## 📞 Contact

**Hope Mobility Kenya**

- 📧 Email: info@hopemobilitykenya.org
- 📱 Phone: +254 700 000 000
- 🌐 Website: www.hopemobilitykenya.org

## 📄 License

This project is proprietary and confidential. All rights reserved by Hope Mobility Kenya.

## 🤝 Contributing

This is a private project. For inquiries about contributing, please contact the project administrators.

## 📝 Git Conventions

This project follows conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

Example:
```bash
git commit -m "feat: add user authentication with OTP"
```

## 🗓️ Project Status

**Status:** Planning & Design Phase  
**Version:** 0.1.0  
**Last Updated:** December 12, 2025

---

**Hope Mobility Kenya** - Empowering Lives Through Technology ♿💙

