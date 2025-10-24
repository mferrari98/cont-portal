# Project Context

## Purpose
React-based portal landing page for Servicoop's Telecommunications and Automation services. Replaces the legacy Flask portal with a modern SPA that provides authentication, role-based access control, and navigation to all infrastructure services.

**Live URL**: https://10.10.9.252/

**Key Goals**:
- Provide unified access point to 6+ infrastructure services
- Support role-based access (admin vs guest users)
- Modern, minimalist UI with dark/light theme support
- Client-side authentication with localStorage persistence

## Tech Stack
- **Frontend Framework**: React 19.1.1 + TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS v4.1.14 with @tailwindcss/postcss
- **UI Components**: HeroUI 2.8.5 (previously NextUI) - React UI library
- **Icons**: Lucide React
- **Web Server**: Nginx (serves static files + reverse proxy)
- **Runtime**: Node.js (development only)

**Architecture Type**: Single-page application (SPA)
- No backend API
- Client-side routing (React)
- State management via localStorage
- Static file deployment to `/var/www/portal-servicios/dist/`
- HeroUI provides accessible components with built-in theming

## Project Conventions

### Code Style
**Path Aliases**:
- Use `@/` prefix for all imports (maps to `./src/`)
- Example: `import { Button } from '@/components/ui/button'`
- Configured in `vite.config.ts`, `tsconfig.app.json`, and `components.json`

**Component Structure**:
- UI components from `@heroui/react` package (Card, Button, Input, Chip)
- App-specific components in `src/components/` (Login.tsx)
- Theme colors managed via HeroUI Tailwind plugin

**Naming Conventions**:
- PascalCase for components: `Login.tsx`, `App.tsx`
- camelCase for functions and variables
- CSS variables use kebab-case: `--bg-main`, `--text-primary`

**TypeScript**:
- Strict type checking enabled
- Interface definitions for all props and state
- No implicit any

### Architecture Patterns
**Frontend Architecture**:
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌──────────────┐
│ Nginx :443   │ Serves /var/www/portal-servicios/dist
│              │ Reverse proxies to backend services
└──────┬───────┘
       │
       ├─→ /guardias/  → Flask (localhost:5000)
       ├─→ /monitor/   → FastAPI (localhost:8000)
       ├─→ /reporte/   → External (10.10.3.50:3000)
       └─→ [other services...]
```

**State Management**:
- No external state library (Redux, Zustand, etc.)
- Application state in React component state
- Persistence via localStorage:
  - `portal_user`: 'admin' | 'invitado'
  - `portal_theme`: 'dark' | 'light'

**Routing**:
- No client-side router (React Router)
- Service navigation via external links
- Each service card links to Nginx location blocks

**Design Pattern**:
- Component composition over inheritance
- Minimalist UI - no hover effects, popups, or badges
- Theme switching via CSS custom properties
- Role-based rendering (filter services by user role)

### Testing Strategy
**Current Status**: No automated tests configured

**Manual Testing**:
- Verify build output with `npm run build`
- Preview production build with `npm run preview`
- Test in production environment at https://10.10.9.252/
- Browser compatibility: Chrome, Firefox, Safari, Edge (2024+)

**Testing Checklist**:
- [ ] Login with admin/admin credentials
- [ ] Login as guest user
- [ ] Verify admin sees all 6 services
- [ ] Verify guest sees only first 3 services
- [ ] Toggle dark/light theme
- [ ] Test service links navigate correctly
- [ ] Verify logout clears session
- [ ] Hard refresh to test cache behavior

### Git Workflow
**Current Status**: Project is not a git repository

**Deployment Workflow**:
1. Make changes in `/var/www/portal-servicios/src/`
2. Build with elevated permissions: `sudo npm run build`
3. Built files output to `/var/www/portal-servicios/dist/`
4. Nginx automatically serves updated files (no restart needed)
5. Hard refresh browser (`Ctrl+Shift+R`) if caching issues occur

**Build Requirements**:
- Must use `sudo npm run build` due to `/var/www/` permissions
- If permission errors occur: `sudo chown -R $USER:$USER /var/www/portal-servicios/node_modules`

## Domain Context
**Industry**: Telecommunications and Automation Services (Servicoop)

**Use Case**: Internal infrastructure portal providing centralized access to operational tools:
- **Guardias**: Shift calendar/rotation scheduling system (Flask)
- **Reportes**: Report generation service (External at 10.10.3.50:3000)
- **Dash**: Dashboard analytics (10.10.4.125:8050)
- **GIS**: Geographic information system (10.10.5.98)
- **Monitor**: Server monitoring dashboard (FastAPI at localhost:8000)
- **Sitio2**: Additional static site

**Users**:
- **Admin users**: Full access to all 6 services
- **Guest users**: Limited access to first 3 services (guardias, reportes, dash)

**Authentication Model**:
- Client-side only - no backend validation
- Hardcoded credentials: `admin/admin`
- Guest access via "Continue as guest" button
- Session persists in browser until logout or cache clear

## Important Constraints
**Technical Constraints**:
- Application lives in `/var/www/` requiring elevated permissions for builds
- No backend API - all logic is client-side
- No database - state persists only in browser localStorage
- Nginx configuration must match service URLs exactly (with trailing slashes)
- Uses Tailwind CSS v4 (NOT v3) - different syntax and configuration

**Security Constraints**:
- Client-side authentication only - no server-side validation
- Credentials are hardcoded in source code
- No CSRF protection, session tokens, or API authentication
- Suitable for internal network use only

**Design Constraints**:
- Minimalist aesthetic - no hover effects, popups, or badges
- Color palette restricted to:
  - Dark mode: `#222831` (bg), `#2d3340` (cards), `#ffffff` (text)
  - Light mode: `#f5f5f5` (bg), `#ffffff` (cards), `#222831` (text)
- 3-column grid layout for service cards (responsive)

**Browser Requirements**:
- Must support CSS Grid, Custom Properties, ES2022, React 19
- Tested on Chrome, Firefox, Safari, Edge (2024+)

## External Dependencies
**Infrastructure**:
- **Nginx**: Web server at `/etc/nginx/sites-available/portal-servicios`
  - Serves static files from `/var/www/portal-servicios/dist/`
  - Reverse proxies to backend services
  - SSL/TLS termination (HTTPS on port 443)

**Backend Services** (accessed via Nginx reverse proxy):
- `/guardias/` → Flask app at localhost:5000
- `/monitor/` → FastAPI app at localhost:8000
- `/reporte/` → External service at 10.10.3.50:3000
- `/dash/` → Dashboard at 10.10.4.125:8050
- `/gis/` → GIS system at 10.10.5.98
- `/sitio2/` → Static site

**Related Infrastructure**:
- `/var/www/guardias/` - Flask shift calendar system
- `/var/www/monitor-servidor/` - FastAPI server monitoring dashboard
- `/var/www/portal/` - Original legacy Flask portal (deprecated)

**Build Dependencies**:
- Node.js (for development server and build process)
- npm (package management)
- Vite (bundling and dev server)

**External CDNs/Services**: None (all assets bundled locally)
