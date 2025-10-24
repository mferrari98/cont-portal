# Design: HeroUI Migration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              HeroUIProvider (root)                     │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │           App Component                          │ │ │
│  │  │  ┌────────────────┐  ┌─────────────────────┐    │ │ │
│  │  │  │  Login Screen  │  │   Main Dashboard    │    │ │ │
│  │  │  │  - Input       │  │   - Card (services) │    │ │ │
│  │  │  │  - Button      │  │   - Button (nav)    │    │ │ │
│  │  │  │  - Card        │  │   - Avatar (user)   │    │ │ │
│  │  │  └────────────────┘  └─────────────────────┘    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Tailwind CSS v4     │
                   │  + HeroUI Plugin     │
                   └──────────────────────┘
```

## Component Mapping Strategy

### Current → HeroUI Migration Map

| Current Component | Element Type | HeroUI Replacement | Props/Config |
|-------------------|--------------|-------------------|--------------|
| Login card wrapper | `<div>` with borders | `<Card>` | `className="bg-[#252422] border-[#FFFCF2]/30"` |
| Username input | `<input type="text">` | `<Input>` | `variant="bordered"`, `startContent={<User/>}` |
| Password input | `<input type="password">` | `<Input>` | `type="password"`, `variant="bordered"` |
| Login button | `<button>` (submit) | `<Button>` | `color="warning"` (orange accent) |
| Guest button | `<button>` (outlined) | `<Button>` | `variant="bordered"` |
| Service card | `<a>` + `<div>` | `<Card>` + `<CardBody>` | `isPressable`, `as="a"`, `href={url}` |
| Top bar buttons | `<button>` | `<Button>` | `isIconOnly`, `variant="light"` |
| User badge | `<div>` with user icon | `<Chip>` or `<Avatar>` | `startContent={<User/>}` |
| Error message | `<div>` with red border | `<Alert>` or inline validation | `color="danger"` |

### Design Principles

1. **Preserve Current Layout**: Service grid remains 3-column responsive
2. **Maintain Color Palette**: Custom theme configuration matches existing colors
3. **Keep Minimalist Style**: Use `variant="light"` or `variant="bordered"` for subtle appearance
4. **No Unnecessary Animations**: Disable default HeroUI animations to match current static feel
5. **Accessibility First**: Let HeroUI handle ARIA, focus states, keyboard navigation

## Theme Configuration

### Tailwind Config Extension

```javascript
// tailwind.config.js
import { heroui } from "@heroui/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: "#252422",
            foreground: "#FFFCF2",
            primary: {
              DEFAULT: "#EB5E28",
              foreground: "#FFFCF2"
            },
            default: {
              DEFAULT: "#252422",
              foreground: "#FFFCF2"
            }
          }
        },
        light: {
          colors: {
            background: "#FFFCF2",
            foreground: "#252422",
            primary: {
              DEFAULT: "#EB5E28",
              foreground: "#FFFCF2"
            },
            default: {
              DEFAULT: "#FFFCF2",
              foreground: "#252422"
            }
          }
        }
      }
    })
  ]
}
```

### Theme Switching Logic

Current implementation uses `localStorage` + manual CSS class application:
```typescript
// Current: App.tsx
const [theme, setTheme] = useState<'light' | 'dark'>('dark')
localStorage.setItem('portal_theme', newTheme)
```

**New implementation** with HeroUI:
```typescript
// Updated: App.tsx with HeroUIProvider
<HeroUIProvider>
  <main className={theme === 'dark' ? 'dark' : 'light'}>
    {/* app content */}
  </main>
</HeroUIProvider>
```

HeroUI automatically applies theme when `dark` class is present on parent.

## Component-Specific Implementation

### 1. Login Screen (`src/components/Login.tsx`)

**Before** (custom components):
```tsx
<input
  type="text"
  className="w-full pl-11 pr-4 py-3 bg-[#252422] border-2 border-[#FFFCF2]/30..."
/>
```

**After** (HeroUI):
```tsx
<Input
  type="text"
  label="Usuario"
  variant="bordered"
  startContent={<User className="w-5 h-5" />}
  classNames={{
    input: "text-base",
    inputWrapper: "border-2 border-[#FFFCF2]/30"
  }}
/>
```

**Key Changes**:
- Remove custom input styling classes
- Use HeroUI's `classNames` prop for customization
- Built-in label positioning (no separate `<label>` tag needed)
- Automatic focus states and ARIA attributes

### 2. Service Cards (`src/App.tsx`)

**Before**:
```tsx
<a href={service.url} className="block">
  <div className="h-full p-6 rounded-lg border...">
    {/* icon + text */}
  </div>
</a>
```

**After**:
```tsx
<Card
  isPressable
  as="a"
  href={service.url}
  className="border-[#FFFCF2]/20 hover:border-[#FFFCF2]/40"
>
  <CardBody className="p-6">
    <div className="flex items-start gap-4">
      {/* icon */}
      <div>{service.icon}</div>
      <div>
        <h3 className="text-xl font-medium">{service.name}</h3>
        <p className="text-sm">{service.desc}</p>
      </div>
    </div>
  </CardBody>
</Card>
```

**Key Changes**:
- `isPressable` adds hover/press states
- `as="a"` renders semantic `<a>` tag
- Built-in focus ring and keyboard navigation
- Card handles responsive spacing

### 3. Top Bar Buttons

**Before**:
```tsx
<button
  onClick={toggleTheme}
  className="w-8 h-8 rounded-md border flex items-center justify-center..."
>
  <Moon className="w-4 h-4" />
</button>
```

**After**:
```tsx
<Button
  isIconOnly
  variant="bordered"
  onClick={toggleTheme}
  className="w-8 h-8"
>
  <Moon className="w-4 h-4" />
</Button>
```

**Key Changes**:
- `isIconOnly` optimizes for icon buttons
- `variant="bordered"` matches current outlined style
- Automatic hover states and ripple effect (can disable if needed)

## Data Flow & State Management

**No changes required** - state management remains identical:
- `localStorage` for theme + user persistence
- React `useState` for component state
- No external state library

HeroUI components are controlled components that work with existing state:
```tsx
<Input
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
```

## Build & Bundle Considerations

### Bundle Size Impact

| Package | Size (minified + gzipped) |
|---------|---------------------------|
| `@heroui/react` (full) | ~80KB |
| Individual components (tree-shaken) | ~15-30KB |

**Mitigation**: Import only needed components:
```typescript
// Instead of:
import { Button, Input, Card } from "@heroui/react"

// Use:
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { Card } from "@heroui/card"
```

### Vite Configuration

**No changes needed** - HeroUI works with existing Vite setup. Just add Tailwind content paths (shown in theme config above).

## Testing Strategy

### Visual Regression Testing

**Manual testing checklist**:
1. Login screen renders correctly (dark theme default)
2. Inputs accept text and show validation errors
3. Login button submits form
4. Guest button bypasses login
5. Service cards display in 3-column grid
6. Cards are clickable and navigate correctly
7. Theme toggle switches dark/light
8. Logout button clears session
9. User badge shows correct role (admin/invitado)

### Accessibility Testing

**Built-in HeroUI features** (no manual implementation):
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Focus indicators (visible focus rings)
- ✅ Screen reader labels (ARIA attributes)
- ✅ Color contrast (customizable via theme)

**Manual verification**:
- Test with keyboard only (no mouse)
- Test with screen reader (NVDA/JAWS)
- Verify focus trap in login form

## Migration Path

### Phase 1: Setup (Non-breaking)
1. Install `@heroui/react`
2. Configure Tailwind with HeroUI plugin
3. Add `HeroUIProvider` to `App.tsx`
4. Verify build succeeds

### Phase 2: Login Screen (Isolated)
1. Replace Login inputs with HeroUI `Input`
2. Replace buttons with HeroUI `Button`
3. Test login flow works identically

### Phase 3: Main Dashboard (Incremental)
1. Replace service cards with HeroUI `Card`
2. Replace top bar buttons with HeroUI `Button`
3. Replace user badge with HeroUI `Chip` or `Avatar`

### Phase 4: Theme & Polish
1. Finalize theme colors in Tailwind config
2. Adjust spacing/sizing to match original design
3. Disable unnecessary animations if needed

### Phase 5: Cleanup
1. Remove unused custom component code
2. Update CLAUDE.md documentation
3. Remove Shadcn references from docs

## Rollback Plan

If issues arise, rollback is simple:
1. `npm uninstall @heroui/react`
2. Remove HeroUI plugin from `tailwind.config.js`
3. Remove `HeroUIProvider` wrapper
4. Restore original component code from git history (if versioned)

**Recommendation**: Create backup branch before migration.

## Open Questions

1. **Animation preferences**: Should we disable HeroUI's default animations to maintain current static feel?
   - **Recommendation**: Start with animations enabled, disable if user feedback prefers static

2. **Error handling**: Should we use HeroUI's built-in form validation or keep custom error messages?
   - **Recommendation**: Use HeroUI's `isInvalid` + `errorMessage` props for consistency

3. **Button sizing**: HeroUI has size variants (`sm`, `md`, `lg`). Which matches current 8x8 icon buttons?
   - **Recommendation**: Use `size="sm"` + custom `className="w-8 h-8"`

## Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Keep custom components | No migration effort | Accessibility burden, maintenance | ❌ Rejected |
| Use Shadcn UI | Copy-paste simplicity | More boilerplate, less cohesive | ❌ Rejected |
| Use Chakra UI | Mature ecosystem | Heavier runtime, emotion.js | ❌ Rejected |
| Use Radix UI primitives | Maximum flexibility | More manual composition | ❌ Rejected |
| **Use HeroUI** | Tailwind-native, accessible, TypeScript | Small bundle addition | ✅ **Selected** |

## References

- HeroUI Vite Guide: https://www.heroui.com/docs/frameworks/vite
- Component API Docs: https://www.heroui.com/docs/components
- Theming Guide: https://www.heroui.com/docs/customization/theme
- React Aria (foundation): https://react-spectrum.adobe.com/react-aria/
