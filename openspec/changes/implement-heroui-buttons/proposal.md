# Implement HeroUI Button Components

## Summary
Install and configure HeroUI library to replace native HTML buttons with accessible HeroUI Button components across the portal application. This change focuses specifically on button elements (login, logout, guest access, theme toggle) to establish the foundation for future HeroUI component adoption.

## Problem Statement
The current implementation uses native HTML `<button>` elements with custom Tailwind CSS styling:
- **No built-in accessibility features**: Missing proper ARIA attributes for button states (loading, disabled)
- **Inconsistent styling**: Each button requires manual class composition
- **Limited variants**: Hard to maintain button variants (solid, bordered, icon-only)
- **No keyboard navigation polish**: Focus states are manually implemented
- **Documentation mismatch**: `CLAUDE.md` and `project.md` claim HeroUI 2.8.5 is installed, but `package.json` shows it's missing

**Current buttons in codebase**:
1. Login form submit button (`Login.tsx:95`)
2. Guest access button (`Login.tsx:114`)
3. Theme toggle button (`App.tsx:139`)
4. Logout button (`App.tsx:147`)

## Proposed Solution
Install `@heroui/react` and `framer-motion` (peer dependency), configure the HeroUI Tailwind plugin, and replace all 4 button instances with HeroUI `<Button>` component.

### Specific Changes

#### 1. Installation
```bash
npm install @heroui/react framer-motion
```

#### 2. Tailwind Configuration
Update `tailwind.config.js` to include HeroUI plugin:
```javascript
import { heroui } from "@heroui/react"

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}" // Add HeroUI content
  ],
  theme: {
    extend: {},
  },
  plugins: [heroui({
    themes: {
      dark: {
        colors: {
          background: "#252422",
          foreground: "#FFFCF2",
          primary: {
            DEFAULT: "#EB5E28",
            foreground: "#FFFCF2",
          },
        },
      },
      light: {
        colors: {
          background: "#FFFCF2",
          foreground: "#252422",
          primary: {
            DEFAULT: "#EB5E28",
            foreground: "#FFFCF2",
          },
        },
      },
    },
  })],
}
```

#### 3. Provider Setup
Wrap `App.tsx` root with `<HeroUIProvider>`:
```tsx
import { HeroUIProvider } from "@heroui/react"

// In index.tsx or App.tsx
<HeroUIProvider>
  <App />
</HeroUIProvider>
```

#### 4. Button Replacements

**Login submit button** (`Login.tsx:95-100`):
```tsx
// Before:
<button type="submit" className="w-full py-3 px-4 bg-[#EB5E28]...">
  Iniciar sesión
</button>

// After:
<Button type="submit" color="primary" size="lg" fullWidth>
  Iniciar sesión
</Button>
```

**Guest button** (`Login.tsx:114-120`):
```tsx
// Before:
<button type="button" onClick={handleGuest} className="w-full py-3 px-4 bg-[#252422] border-2...">
  Continuar como invitado
</button>

// After:
<Button type="button" onClick={handleGuest} variant="bordered" size="lg" fullWidth>
  Continuar como invitado
</Button>
```

**Theme toggle button** (`App.tsx:139-144`):
```tsx
// Before:
<button onClick={toggleTheme} className="w-8 h-8 rounded-md border flex items-center...">
  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
</button>

// After:
<Button isIconOnly onClick={toggleTheme} variant="bordered" size="sm">
  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
</Button>
```

**Logout button** (`App.tsx:147-153`):
```tsx
// Before:
<button onClick={handleLogout} className="w-8 h-8 rounded-md border flex items-center...">
  <LogOut className="w-4 h-4" />
</button>

// After:
<Button isIconOnly onClick={handleLogout} variant="bordered" size="sm" title="Cerrar sesión">
  <LogOut className="w-4 h-4" />
</Button>
```

## Benefits
- **Accessibility**: Automatic ARIA attributes, focus management, keyboard navigation
- **Consistency**: Unified button API across the app (color, size, variant props)
- **Maintainability**: No need to manually compose Tailwind classes for each button
- **Type Safety**: Full TypeScript support with autocomplete for button props
- **Documentation alignment**: Matches what `CLAUDE.md` claims is already installed

## Risks & Mitigation
| Risk | Mitigation |
|------|------------|
| Bundle size increase (~50KB) | Acceptable for accessibility/maintainability gains |
| Visual differences from current buttons | Configure HeroUI theme to match exact colors |
| Framer Motion dependency adds weight | Required for HeroUI animations; tree-shakeable |
| Breaking change if HeroUI updates | Pin to `@heroui/react@^2.8.5` in `package.json` |

## Out of Scope
- Service card components (remain as `<a>` tags with Tailwind)
- Input components (future change)
- Card components (future change)
- Chip/Badge components (future change)
- Navigation or routing changes

## Success Criteria
- [x] `@heroui/react` and `framer-motion` installed in `package.json`
- [x] HeroUI Tailwind plugin configured with custom theme colors
- [x] `<HeroUIProvider>` wraps app root
- [x] All 4 buttons use HeroUI `<Button>` component
- [x] Visual appearance matches current design (colors, sizes, spacing)
- [x] Buttons are keyboard accessible (Tab, Enter, Space)
- [x] TypeScript compilation succeeds with no errors
- [x] Production build succeeds: `sudo npm run build`
- [x] Manual testing: login, logout, guest access, theme toggle all work

## Dependencies
- Requires React 19.1.1 ✓ (already installed)
- Requires Tailwind CSS v4.1.14 ✓ (already installed)
- Requires Vite 7.1.7 ✓ (already installed)
- New dependency: `@heroui/react@^2.8.5`
- New peer dependency: `framer-motion@^11.15.0`

## Timeline Estimate
- Package installation: 5 minutes
- Tailwind configuration: 10 minutes
- Provider setup: 5 minutes
- Button component replacement: 20 minutes
- Testing & validation: 15 minutes
- **Total**: ~1 hour

## Related Changes
- Builds on completed `migrate-to-heroui` (archived)
- Unblocks future changes: `implement-heroui-inputs`, `implement-heroui-cards`

## References
- HeroUI Button Docs: https://www.heroui.com/docs/components/button
- HeroUI Installation: https://www.heroui.com/docs/guide/installation
- Vite Integration: https://www.heroui.com/docs/frameworks/vite
