<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React-based portal landing page for Servicoop's Telecommunications and Automation services. Replaces the legacy Flask portal with a modern SPA that provides authentication, role-based access control, and navigation to all infrastructure services.

**Live URL**: https://10.10.9.252/

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌──────────────┐
│ Nginx        │ Serves /var/www/portal-servicios/dist
│ :443 (SSL)   │ Reverse proxies to backend services
└──────┬───────┘
       │
       ├─→ /guardias/  → Flask (localhost:5000)
       ├─→ /monitor/   → FastAPI (localhost:8000)
       ├─→ /reporte/   → External (10.10.3.50:3000)
       ├─→ /dash/      → Dashboard (10.10.4.125:8050)
       ├─→ /gis/       → GIS (10.10.5.98)
       └─→ /sitio2/    → Static site
```

**Stack**:
- React 19.1.1 + TypeScript 5.9.3
- Vite 7.1.7 (build tool)
- Tailwind CSS v4.1.14 with @tailwindcss/postcss
- shadcn/ui - React UI component library built on Radix UI
- Lucide React icons

**Key Characteristics**:
- Single-page application (SPA) with client-side routing handled by React
- No backend API - authentication is client-side only (localStorage)
- Nginx serves the built static files from `dist/` and reverse-proxies service URLs
- All state persists in browser localStorage (no database)

## Development Commands

```bash
# Install dependencies
npm install

# Development server (hot reload on http://localhost:5173)
npm run dev

# Type check + production build
npm run build

# Production build output → /var/www/portal-servicios/dist/

# Lint code
npm run lint

# Preview production build locally
npm run preview
```

## Build & Deployment Workflow

**IMPORTANT**: The application must be built with elevated permissions since it lives in `/var/www/`:

```bash
cd /var/www/portal-servicios
sudo npm run build
```

After building:
1. Built files are written to `/var/www/portal-servicios/dist/`
2. Nginx automatically serves the updated files (no restart needed)
3. Hard refresh browser (`Ctrl+Shift+R`) if caching issues occur

**Nginx Configuration**: `/etc/nginx/sites-available/portal-servicios`
- Symlinked to `/etc/nginx/sites-enabled/portal-servicios`
- Reload config: `sudo systemctl reload nginx`
- Test config: `sudo nginx -t`

## Authentication System

**Client-side only** - no backend validation:

```typescript
// Login credentials (hardcoded in src/components/Login.tsx)
Username: admin
Password: admin
```

**Role-Based Access**:
- **Admin user**: Sees all 6 services (guardias, reportes, dash, gis, monitor, sitio2)
- **Guest user**: Sees only first 3 services (guardias, reportes, dash)

**Session Storage**:
```typescript
localStorage.setItem('portal_user', 'admin' | 'invitado')
localStorage.setItem('portal_theme', 'dark' | 'light')
```

Session persists until:
- User clicks logout button
- Browser cache is cleared
- User manually clears localStorage

**Logic**: See `App.tsx:120`:
```typescript
const services = user === 'admin' ? allServices : allServices.slice(0, 3)
```

## Design System

**Color Palette** (minimalist dark theme):
- Background: `#222831` (dark navy)
- Cards: `#2d3340` (slightly lighter than background)
- Borders: `#3d4452` (subtle outline)
- Text/Details: `#ffffff` (pure white for all text, icons, accents)

**Light Mode**:
- Background: `#f5f5f5`
- Cards: `#ffffff`
- Borders: `#e0e0e0`
- Text: `#222831` (dark text on light background)

**Theme Toggle**:
- Implemented via CSS custom properties (`--bg-main`, `--bg-card`, etc.)
- Toggle button in top-right corner
- Theme applied with `document.documentElement.style.setProperty()`
- See `App.tsx:85-101` (applyTheme function)

**Design Constraints**:
- Minimalist aesthetic - no hover effects, no popups, no badges
- Clean service cards with simple icons
- Header with title/subtitle aligned left
- 3-column grid layout for service cards (responsive)

## Key Components

### App.tsx
Main application component containing:
- Authentication state management
- Theme switching logic
- Service card grid
- Role-based service filtering
- Logout functionality

### Login.tsx
Authentication UI with:
- Username/password form
- "Continue as guest" option
- Error message display
- Inline styles matching theme

### Service Configuration
Edit service cards in `App.tsx:25-68`:
```typescript
const allServices: Service[] = [
  {
    id: 'guardias',
    name: 'Guardias',
    icon: <Shield className="h-6 w-6" />,
    desc: 'Cronograma de guardias rotativas',
    url: '/guardias/'
  },
  // ... more services
]
```

**IMPORTANT**: All service URLs must:
- Have trailing slashes (`/guardias/`, not `/guardias`)
- Match Nginx location blocks in `/etc/nginx/sites-available/portal-servicios`

## shadcn/ui Components

**Library**: shadcn/ui - Collection of reusable components built on Radix UI and Tailwind CSS
**Style**: new-york (minimalist, clean design)
**Documentation**: https://ui.shadcn.com/
**Path Alias**: `@/` → `./src/` (configured in vite.config.ts and tsconfig.app.json)

**Installed Components** (in `src/components/ui/`):
- Button - Action buttons with variants (default, outline, ghost, destructive)
- Card, CardContent, CardHeader - Container components for grouping content
- Input - Form text/password inputs
- Badge - Small badge/label component for displaying status
- Separator - Horizontal/vertical separator lines
- Tooltip - Tooltip component with Radix UI primitives

**Adding New Components**:
```bash
npx shadcn@latest add <component-name>
# Example: npx shadcn@latest add dialog
# Components are added to src/components/ui/
import { ComponentName } from "@/components/ui/component-name"
```

**Key Features**:
- Automatic accessibility via Radix UI primitives (ARIA attributes, keyboard navigation)
- Full dark/light theme support via CSS variables
- TypeScript-first with complete type safety
- Copy-paste components (no package dependency, you own the code)
- Highly customizable via Tailwind classes

**Theme Configuration**:
shadcn/ui uses CSS variables defined in `src/index.css` and configured in `tailwind.config.js`:
- Dark mode: Class-based (`darkMode: ["class"]`)
- Colors use HSL CSS variables (--background, --foreground, --primary, etc.)
- Custom primary color: `#EB5E28` (orange)

**MCP Server**:
The project has shadcn MCP server configured in `.mcp.json`:
- Enables AI assistants to browse, search, and install shadcn/ui components
- Use natural language prompts like "Add the dialog component" or "Show me all available components"
- Configuration: `npx shadcn@latest mcp`

## Tailwind CSS v4 Configuration

**CRITICAL**: This project uses Tailwind CSS v4 with PostCSS plugin, NOT v3.

**postcss.config.js**:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**index.css**:
```css
@import "tailwindcss";
```

**DO NOT**:
- Use `@tailwind base/components/utilities` (v3 syntax)
- Use `theme.extend` in tailwind.config.js (use CSS variables instead)
- Reference undefined utility classes

## Common Tasks

### Adding a New Service Card

1. Add service to `allServices` array in `App.tsx:25-68`
2. Ensure Nginx has matching location block in `/etc/nginx/sites-available/portal-servicios`
3. Test Nginx config: `sudo nginx -t`
4. Reload Nginx: `sudo systemctl reload nginx`
5. Build React app: `sudo npm run build`

### Changing Colors

All colors controlled via CSS custom properties in `applyTheme()` function (`App.tsx:85-101`).

**Pattern**:
```typescript
document.documentElement.style.setProperty('--bg-main', '#222831')
```

Update both dark and light mode branches. Inline styles in components reference these CSS variables with `var(--bg-main)`.

### Modifying Authentication

**Login credentials**: `src/components/Login.tsx:19`
```typescript
if (username === "admin" && password === "admin") {
  onLogin("admin")
}
```

**Service visibility logic**: `src/App.tsx:120`
```typescript
const services = user === 'admin' ? allServices : allServices.slice(0, 3)
```

Change `.slice(0, 3)` to adjust how many services guests see.

## Path Aliases

Project uses `@/` alias for cleaner imports:

```typescript
// Instead of:
import { Login } from '../../components/Login'
import { Button } from '../../components/ui/button'

// Write:
import { Login } from '@/components/Login'
import { Button } from '@/components/ui/button'
```

Configured in:
- `vite.config.ts` (line 9-11)
- `tsconfig.app.json` (line 12-15)

## Related Infrastructure

- `/var/www/guardias/` - Flask shift calendar system
- `/var/www/monitor-servidor/` - FastAPI server monitoring dashboard
- `/var/www/portal/` - Original legacy Flask portal (deprecated)

Each service has its own CLAUDE.md documentation.

## Browser Compatibility

Requires modern browser supporting:
- CSS Grid
- CSS Custom Properties
- ES2022 JavaScript features
- React 19 features

Tested on Chrome, Firefox, Safari, Edge (2024+).

## Troubleshooting

**Build fails with permission errors**:
```bash
sudo chown -R $USER:$USER /var/www/portal-servicios/node_modules
```

**Theme toggle not working**:
- Check `applyTheme()` function uses `document.documentElement.style.setProperty()`
- Verify CSS variables are used in component styles (not hardcoded colors)

**Service URLs not working**:
- Verify trailing slashes in service URLs
- Check Nginx location blocks match exactly
- Test nginx config: `sudo nginx -t`
- Check nginx error logs: `sudo tail -f /var/log/nginx/portal-servicios_error.log`

**Changes not appearing after build**:
- Hard refresh browser: `Ctrl+Shift+R`
- Clear browser cache
- Verify files in `/var/www/portal-servicios/dist/` were updated (check timestamps)
