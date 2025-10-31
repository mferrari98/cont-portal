# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server with hot reload
npm run dev

# Build for production (TypeScript compile + Vite build)
npm run build

# Type check without emitting files
npx tsc --noEmit

# Lint code
npm run lint

# Preview production build locally
npm run preview
```

### Build Process Notes
- Build script runs TypeScript compilation first (`npx tsc -b`), then Vite build
- Use `sudo npm run build` if working in `/var/www/` with restricted permissions
- Output goes to `dist/` directory with optimized static assets

## Architecture Overview

### Tech Stack
- **React 19.1.1** with TypeScript 5.9.3
- **Vite 7.1.7** as build tool and dev server
- **Tailwind CSS v4.1.14** with PostCSS plugin (NOT v3 syntax)
- **shadcn/ui** components built on Radix UI
- **Lucide React** for icons

### Application Structure
This is a single-page application (SPA) serving as an authentication and navigation portal for Servicoop's infrastructure services.

**Key Architectural Patterns:**
- **Client-side authentication** with localStorage persistence (no backend)
- **Role-based access control** (admin vs guest access to services)
- **Component-based architecture** using shadcn/ui design system
- **Theme system** with dark/light modes using CSS custom properties

### Core Components

#### App.tsx (Main Application)
- Contains `Service` type definition and `allServices` array (lines 29-72)
- Implements authentication state management via localStorage
- Handles service filtering based on user role (admin sees all 6 services, guest sees first 3)
- Manages theme switching with `isDark` state and `applyTheme()` function
- Service URLs must have trailing slashes and match Nginx configuration

#### Login.tsx (Authentication)
- Hardcoded credentials: admin/admin, guest access via button
- Implements form validation and error handling
- Uses `onLogin` callback to set user state in parent App component
- Theme-aware styling with dark/light mode support

#### UI Components (src/components/ui/)
- shadcn/ui components with customizable variants
- Use `@/components/ui/[component]` import path
- Components can be customized freely after installation
- Install new components: `npx shadcn@latest add [component-name]`

### Service Configuration
Services are defined in `src/App.tsx:29-72` with this structure:
```typescript
{
  id: string,
  name: string,
  icon: ReactNode,
  desc: string,
  url: string // Must end with trailing slash
}
```

**Important:** Service URLs must:
- Have trailing slashes (`/service/` not `/service`)
- Match Nginx location blocks for proper routing

### Theme System
- Colors centralized in `src/App.tsx:149-165` and `src/components/Login.tsx:34-41`
- Uses CSS custom properties and class-based theming
- Dark mode: `bg-[#0d0d0d]`, light mode: `bg-[#ffffff]`
- Theme persistence via localStorage

### Path Aliases
- `@/` maps to `./src/`
- Configured in both `vite.config.ts` and `tsconfig.app.json`
- Use imports like `import { Button } from '@/components/ui/button'`

### Tailwind CSS v4 Configuration
**Critical:** This project uses Tailwind CSS v4 with PostCSS plugin
- PostCSS config uses `@tailwindcss/postcss` plugin
- CSS import: `@import "tailwindcss";` (NOT v3 `@tailwind base/components/utilities`)
- Do not use `theme.extend` in tailwind.config.js for custom colors

## Development Guidelines

### Adding New Services
1. Edit `allServices` array in `src/App.tsx:29-72`
2. Ensure URL has trailing slash
3. Icon should be Lucide React component
4. Position determines guest access (first 3 services only)

### Modifying Colors/Theme
- Edit theme classes in `src/App.tsx:149-165`
- Colors use inline Tailwind classes with custom hex values
- Maintain consistency between dark and light themes

### Code Style
- ESLint configuration enforces React and TypeScript best practices
- Components use function declarations with TypeScript interfaces
- State management via React hooks (useState, useEffect)
- Utility functions in `src/lib/utils.ts` (cn function for class merging)

### Authentication Flow
1. User lands on Login component
2. Credentials validated against hardcoded values
3. Successful auth stores user in localStorage and updates App state
4. App filters services based on user role
5. Logout removes user from localStorage and shows confirmation dialog

## Deployment Architecture
- SPA served by Nginx from `dist/` directory
- Nginx reverse proxies service requests to backend applications
- No backend required for the portal itself (fully client-side)
- HTTPS recommended for production security