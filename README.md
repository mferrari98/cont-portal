# Portal de Servicios - Servicoop

Modern landing portal for Servicoop's Telecommunications and Automation services. A clean, minimalist SPA with role-based access control, dark/light theme support, and smooth animations.

## 🚀 Live Demo

**Production URL**: `https://10.10.9.252/`

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Design System](#design-system)
- [Browser Support](#browser-support)
- [License](#license)

## 🎯 Overview

Single-page application that serves as the central authentication and navigation hub for Servicoop's infrastructure services. Features client-side authentication with role-based access control, allowing administrators to access all 6 services while guests are limited to the first 3.

### Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌──────────────┐
│ Nginx        │ Serves static files from dist/
│ :443 (SSL)   │ Reverse proxies to backend services
└──────┬───────┘
       │
       ├─→ /guardias/  → Flask (localhost:5000)
       ├─→ /monitor/   → FastAPI (localhost:8000)
       ├─→ /reporte/   → External (10.10.3.50:3000)
       ├─→ /dash/      → Dashboard (10.10.4.125:8050)
       ├─→ /gis/       → GIS (10.10.5.98)
       └─→ /emp/       → Management portal
```

## 🛠 Tech Stack

### Core
- **React 19.1.1** - UI library
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.1.7** - Build tool and dev server

### Styling
- **Tailwind CSS v4.1.14** - Utility-first CSS framework
- **@tailwindcss/postcss** - PostCSS plugin for Tailwind v4
- **shadcn/ui** - Accessible component library built on Radix UI

### UI Components
- **Radix UI** - Headless accessible components
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-tooltip` - Tooltips
  - `@radix-ui/react-separator` - Visual dividers
- **Lucide React** - Beautiful icon library

### Development Tools
- **ESLint 9** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite Plugin React SWC** - Fast React refresh with SWC

## ✨ Features

### Authentication
- Client-side authentication (no backend)
- Two user roles:
  - **Admin**: Full access to all 6 services
  - **Guest**: Limited access to first 3 services
- Persistent sessions via localStorage
- Logout confirmation dialog

### UI/UX
- 🎨 **Dual Theme Support**: Dark and light modes
- 🎴 **3D Flip Cards**: Interactive service cards with 1.5s hover delay
- ✍️ **Typewriter Animation**: Animated title on page load
- 🌊 **Mesh Gradients**: Smooth animated background
- 📱 **Responsive Design**: Mobile, tablet, and desktop support
- 🔒 **Accessibility**: ARIA attributes, keyboard navigation

### Service Cards
Six service cards with flip animations revealing detailed descriptions:
1. **Guardias** - Shift calendar system
2. **Reportes de Agua** - Water level reports by site
3. **Dashboard Exemys** - Real-time Exemys monitoring
4. **GIS** - Geographic information system
5. **Monitor** - Server resource monitoring
6. **Emp** - Business management

## 📦 Installation

### Prerequisites
- **Node.js** 18+ and npm 9+
- Modern browser (Chrome, Firefox, Safari, Edge 2024+)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portal-servicios
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Access at: `http://localhost:5173`

## 💻 Development

### Available Scripts

```bash
# Start dev server with hot reload
npm run dev

# Type check (no emit)
npx tsc --noEmit

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

### Development Workflow

1. Make changes to files in `src/`
2. Vite automatically reloads changes in browser
3. TypeScript errors show in terminal and browser
4. Build before committing: `npm run build`

### Adding New Service Cards

Edit `src/App.tsx:29-72`:

```typescript
const allServices: Service[] = [
  {
    id: 'new-service',
    name: 'Service Name',
    icon: <IconComponent className="w-6 h-6" />,
    desc: 'Short description',
    url: '/service-path/'
  },
  // ... more services
]
```

**Important**: Service URLs must:
- Have trailing slashes (`/service/` not `/service`)
- Match Nginx location blocks (if proxying)

### Customizing Colors

All colors are centralized in `src/App.tsx:149-165` and `src/components/Login.tsx:34-41`:

```typescript
const themeClasses = {
  bg: isDark ? 'bg-[#0d0d0d]' : 'bg-[#ffffff]',
  bgCard: isDark ? 'bg-[#2e2f31]' : 'bg-[#ffffff]',
  // ... more theme classes
}
```

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete color palette and design guidelines.

## 🏗 Build & Deployment

### Production Build

```bash
# Build production bundle
npm run build
```

Output: `dist/` directory with optimized static files.

### Build Output
```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-[hash].js    # JavaScript bundle (minified)
│   └── index-[hash].css   # CSS bundle (purged)
└── [public assets]         # Static assets from public/
```

### Deployment

#### Option 1: Static File Server

```bash
# Copy dist/ contents to web server
cp -r dist/* /var/www/html/

# Or use any static file server
npx serve dist
```

#### Option 2: Nginx Configuration

See CLAUDE.md for Nginx setup details (proxying configuration is not included in this repository).

### Environment Considerations

- **No environment variables needed** - All config is hardcoded
- **No backend required** - Fully client-side application
- **HTTPS recommended** - For production security
- **Path rewriting** - Ensure all service URLs route correctly

## 📁 Project Structure

```
portal-servicios/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── ui/         # shadcn/ui components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── separator.tsx
│   │   │   └── tooltip.tsx
│   │   └── Login.tsx   # Login screen component
│   ├── lib/
│   │   └── utils.ts    # Utility functions (cn)
│   ├── App.tsx         # Main application component
│   ├── index.css       # Global styles + Tailwind
│   ├── main.tsx        # React entry point
│   └── vite-env.d.ts   # Vite type definitions
├── openspec/           # OpenSpec documentation
├── CLAUDE.md           # AI assistant instructions
├── DESIGN_SYSTEM.md    # Design system guide
├── components.json     # shadcn/ui configuration
├── eslint.config.js    # ESLint configuration
├── index.html          # HTML entry
├── package.json        # Dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript base config
├── tsconfig.app.json   # TypeScript app config
├── tsconfig.node.json  # TypeScript node config
└── vite.config.ts      # Vite configuration
```

## ⚙️ Configuration

### Path Aliases

The project uses `@/` as an alias for `./src/`:

```typescript
// Instead of:
import { Button } from '../../components/ui/button'

// Use:
import { Button } from '@/components/ui/button'
```

Configured in:
- `vite.config.ts` (line 9-11)
- `tsconfig.app.json` (line 12-15)

### Tailwind CSS v4

**Important**: This project uses Tailwind CSS v4 with PostCSS plugin.

`postcss.config.js`:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

`src/index.css`:
```css
@import "tailwindcss";
```

**Do NOT use**:
- `@tailwind base/components/utilities` (v3 syntax)
- `theme.extend` in tailwind.config.js
- Undefined utility classes

### shadcn/ui Components

Adding new components:

```bash
npx shadcn@latest add [component-name]

# Example:
npx shadcn@latest add alert
```

Components are copied to `src/components/ui/` and can be customized freely.

## 🎨 Design System

For comprehensive design system documentation including:
- Color palette (dark/light modes)
- Typography system
- Component patterns
- Animation guidelines
- Code examples

See **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**

### Quick Color Reference

**Dark Mode**:
- Background: `#0d0d0d`
- Cards: `#2e2f31`
- Primary Accent: `#00a54f` (green)
- Secondary Accent: `#6ccff6` (cyan)
- Text: `#ffffff`

**Light Mode**:
- Background: `#ffffff`
- Cards: `#ffffff`
- Primary Accent: `#00a54f` (green)
- Text: `#0d0d0d`

## 🌐 Browser Support

Requires modern browser with support for:
- CSS Grid
- CSS Custom Properties
- ES2022 JavaScript features
- React 19 concurrent features

**Tested on**:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

## 🔒 Authentication

**Credentials** (hardcoded in `src/components/Login.tsx:23`):
- **Admin**: Username `admin` / Password `admin`
- **Guest**: Click "Continuar como invitado" button

**Session Storage**:
```typescript
localStorage.setItem('portal_user', 'admin' | 'invitado')
localStorage.setItem('portal_theme', 'dark' | 'light')
```

Session persists until:
- User clicks logout
- Browser cache is cleared
- localStorage is manually cleared

## 🐛 Troubleshooting

### Build Permission Errors
```bash
# If building in /var/www/ with restricted permissions
sudo npm run build
```

### Theme Toggle Not Working
- Check `applyTheme()` uses `document.documentElement.classList`
- Verify CSS variables are used (not hardcoded colors)

### Service URLs Not Working
- Verify trailing slashes in service URLs
- Check Nginx location blocks match exactly
- Test nginx config: `sudo nginx -t`

### Changes Not Appearing
- Hard refresh browser: `Ctrl+Shift+R`
- Clear browser cache
- Check `dist/` timestamps: `ls -lh dist/`

## 📝 License

Copyright © 2025 Servicoop. All rights reserved.

---

**Documentation**: See [CLAUDE.md](./CLAUDE.md) for AI assistant instructions and [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design guidelines.

**Questions?** Contact the development team at Servicoop.
