# Code Style & Conventions

## TypeScript Style

### Type Annotations
- Always use explicit types for function parameters
- Use interface for object shapes, type for unions/intersections
- Prefer type inference for simple variables

Example:
```typescript
interface Service {
  id: string
  name: string
  icon: React.ReactNode
  desc: string
  url: string
}

const allServices: Service[] = [...]
```

### File Naming
- Components: PascalCase (e.g., `Login.tsx`, `App.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- UI components: lowercase with hyphens (e.g., `button.tsx`, `card.tsx`)

### Import Order
1. External dependencies (React, third-party libraries)
2. Internal components (@ alias imports)
3. Icons and assets
4. Types and interfaces

Example:
```typescript
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, LogOut } from "lucide-react"

interface MyProps { ... }
```

## React Patterns

### Component Structure
1. Interface/type definitions
2. Component function
3. State declarations (useState, useEffect)
4. Helper functions
5. Return JSX

### State Management
- Use `useState` for local component state
- Use `localStorage` for persistent data
- No external state management library

### Event Handlers
- Prefix with `handle` (e.g., `handleSubmit`, `handleGuest`)
- Define inline for simple operations, separate function for complex logic

## Styling

### Tailwind CSS
- Use utility classes directly in JSX
- Use `clsx` or `cn()` for conditional classes
- Define theme colors in `tailwind.config.js` using CSS variables
- Use HSL color format with CSS variables

Example:
```typescript
className={`w-full ${themeClasses.text} hover:bg-primary`}
```

### Theme System
- Dark/light mode controlled via `theme` prop or `localStorage`
- Apply theme classes conditionally
- Use CSS custom properties for dynamic theming

### shadcn/ui Components
- Import from `@/components/ui/`
- Customize via className prop
- Use variants for different styles
- Maintain accessibility (ARIA attributes)

## Design Patterns

### Minimalist Aesthetic
- No hover effects on cards (keep it simple)
- No popups or modals (unless necessary)
- No badges or indicators (unless required)
- Clean service cards with simple icons
- Subtle borders and shadows

### Color Scheme
**Dark Mode**:
- Background: `#0d0d0d`
- Cards: `#1a1a1a`
- Text: `#ffffff`
- Primary: `#EB5E28` (orange)

**Light Mode**:
- Background: `#ffffff`
- Cards: `#ffffff`
- Text: `#0d0d0d`
- Primary: `#EB5E28` (orange)

## Authentication

### Security Note
- Client-side only authentication (NO backend validation)
- Credentials are hardcoded in `Login.tsx`
- NOT suitable for production with sensitive data
- For demo/internal use only

### Hardcoded Credentials
```typescript
Username: admin
Password: admin
```

### Role-Based Access
```typescript
// Admin: sees all 6 services
// Guest: sees only first 3 services
const services = user === 'admin' ? allServices : allServices.slice(0, 3)
```

## URL Conventions

### Service URLs
- Always include trailing slashes (e.g., `/guardias/`, not `/guardias`)
- Must match Nginx location blocks
- Use relative URLs for internal services

## Comments

### When to Comment
- Complex logic that isn't immediately obvious
- Workarounds or hacks (with explanation)
- TODO items for future improvements
- API integrations or external service calls

### When NOT to Comment
- Self-explanatory code
- Simple variable assignments
- Standard React patterns

## File Organization

### Component Files
- One component per file
- Co-locate types/interfaces with component
- Export component as named export or default

### UI Components
- Follow shadcn/ui structure
- Keep in `src/components/ui/`
- Export all component parts (e.g., Card, CardContent, CardHeader)
