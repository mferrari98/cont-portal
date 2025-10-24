# Design: HeroUI Button Implementation

## Architecture Overview

This change introduces HeroUI as the UI component library for the portal, starting with Button components. HeroUI is built on top of Tailwind CSS and provides accessible, themeable React components.

```
┌─────────────────────────────────────────┐
│         React Application               │
│  ┌───────────────────────────────────┐  │
│  │     HeroUIProvider (Context)      │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │         App.tsx             │  │  │
│  │  │  ┌──────────┐  ┌──────────┐ │  │  │
│  │  │  │ Button   │  │ Button   │ │  │  │
│  │  │  │ (theme)  │  │ (logout) │ │  │  │
│  │  │  └──────────┘  └──────────┘ │  │  │
│  │  │                              │  │  │
│  │  │  ┌─────────────────────────┐│  │  │
│  │  │  │     Login.tsx           ││  │  │
│  │  │  │  ┌────────┐  ┌────────┐││  │  │
│  │  │  │  │ Button │  │ Button │││  │  │
│  │  │  │  │(submit)│  │(guest) │││  │  │
│  │  │  │  └────────┘  └────────┘││  │  │
│  │  │  └─────────────────────────┘│  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│    Tailwind CSS + HeroUI Plugin         │
│  - Processes utility classes            │
│  - Applies HeroUI theme tokens          │
│  - Generates component styles           │
└─────────────────────────────────────────┘
```

## Component Integration Strategy

### HeroUIProvider Setup
The `HeroUIProvider` must wrap the entire React tree to provide theme context to all HeroUI components.

**Location**: `src/main.tsx`
```tsx
import { HeroUIProvider } from "@heroui/react"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>
)
```

**Why**: HeroUI uses React Context to manage theme state, dark mode, and component defaults. Without the provider, components will throw errors.

### Button Variant Mapping

Current implementation uses custom Tailwind classes. HeroUI provides semantic variants:

| Current Implementation | HeroUI Equivalent | Use Case |
|------------------------|-------------------|----------|
| `bg-[#EB5E28]` (solid orange) | `color="primary"` | Primary actions (login submit) |
| `border-2 border-[#FFFCF2]/30` | `variant="bordered"` | Secondary actions (guest login, toggle) |
| Icon-only with `w-8 h-8` | `isIconOnly size="sm"` | Icon buttons (logout, theme) |

### Theme Configuration

HeroUI theme is configured in `tailwind.config.js` via the `heroui()` plugin:

```javascript
import { heroui } from "@heroui/react"

export default {
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: "#252422",      // Dark charcoal (current bg)
            foreground: "#FFFCF2",      // Cream white (current text)
            primary: {
              DEFAULT: "#EB5E28",       // Orange accent (current primary)
              foreground: "#FFFCF2",    // White text on orange
            },
          },
        },
        light: {
          colors: {
            background: "#FFFCF2",      // Cream (current light bg)
            foreground: "#252422",      // Dark text
            primary: {
              DEFAULT: "#EB5E28",       // Same orange
              foreground: "#FFFCF2",    // White text on orange
            },
          },
        },
      },
    })
  ],
}
```

**Theme Token Flow**:
1. User's browser applies `dark` or `light` class to `<html>`
2. HeroUI plugin provides CSS variables: `--hero-background`, `--hero-primary`, etc.
3. Button component uses these variables internally
4. No manual class application needed in component code

### Dark Mode Synchronization

Current implementation uses custom theme state in `App.tsx`:
```tsx
const [theme, setTheme] = useState<'light' | 'dark'>('dark')
```

**Strategy**: Keep existing theme state for localStorage persistence, apply to `<html>` class:

```tsx
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}, [theme])
```

HeroUI will automatically read the `dark` class and apply the correct theme.

## Technical Decisions

### Decision 1: Gradual Migration (Buttons Only)
**Rationale**:
- Reduces risk by limiting scope to 4 button replacements
- Allows testing HeroUI integration without touching complex components (service cards)
- Establishes pattern for future migrations (inputs, cards)

**Alternatives Considered**:
- ❌ **Full migration at once**: Too risky, high chance of visual regressions
- ❌ **Keep custom buttons**: Misses accessibility benefits, doesn't align with documentation

### Decision 2: Framer Motion as Peer Dependency
**Rationale**:
- HeroUI requires `framer-motion` for animations (ripple effects, transitions)
- Adds ~30KB gzipped, but provides smooth interactions out-of-the-box
- Tree-shakeable - only imports used animation features

**Alternatives Considered**:
- ❌ **Skip animations**: Would require disabling HeroUI animations globally, losing UX polish
- ❌ **Custom CSS transitions**: More code to maintain, less smooth than Framer Motion

### Decision 3: Keep Service Cards as Native Elements
**Rationale**:
- Service cards are `<a>` tags with Tailwind classes, not interactive buttons
- Semantic HTML: Links to external pages should use `<a>`, not `<Button as="a">`
- Reduces scope of this change to interactive buttons only

**Future Consideration**:
- If cards need interactivity (click tracking, keyboard shortcuts), migrate to `<Card>` + `<Button>` combo

### Decision 4: Size Mapping
| Current | HeroUI Size | Reasoning |
|---------|-------------|-----------|
| `py-3 px-4` (login/guest) | `size="lg"` | Matches ~48px height |
| `w-8 h-8` (icon buttons) | `size="sm"` with `isIconOnly` | Matches 32px icon container |

## Performance Impact

### Bundle Size Analysis
**Before HeroUI**:
- React 19: ~130KB (gzipped)
- Lucide Icons: ~5KB (tree-shaken)
- Total: ~135KB

**After HeroUI**:
- React 19: ~130KB
- Lucide Icons: ~5KB
- HeroUI Button: ~15KB (tree-shaken, only Button component)
- Framer Motion: ~30KB (animations)
- **Total: ~180KB** (+45KB / +33% increase)

**Mitigation**:
- Only import `Button` from `@heroui/react` (tree-shaking eliminates unused components)
- Framer Motion is shared dependency (future HeroUI components won't add more weight)
- Acceptable trade-off for accessibility + maintainability

### Runtime Performance
- **No CSS-in-JS overhead**: HeroUI uses Tailwind CSS (build-time processing)
- **No additional React Context overhead**: HeroUIProvider is lightweight wrapper
- **Framer Motion animations**: 60fps, GPU-accelerated, no jank

## Testing Strategy

### Unit Tests (Future)
- Not in scope for this change (no test framework configured)
- Future: Test button click handlers, theme toggle logic

### Integration Tests
Manual testing checklist:
1. **Login flow**: Submit with Enter key, click with mouse
2. **Guest flow**: Click guest button, verify limited service access
3. **Theme toggle**: Click moon/sun icon, verify colors swap
4. **Logout**: Click logout, verify localStorage cleared
5. **Keyboard nav**: Tab through all buttons, activate with Enter/Space

### Visual Regression
- Compare screenshots before/after migration
- Use browser DevTools to verify:
  - Button heights match original (48px for large, 32px for icon)
  - Colors match exactly (#EB5E28, #FFFCF2, #252422)
  - Border widths consistent (2px)

## Rollback Strategy

If critical issues arise post-deployment:

1. **Immediate rollback** (< 5 minutes):
   ```bash
   cd /var/www/portal-servicios
   git checkout HEAD~1 src/
   sudo npm run build
   ```

2. **Package rollback** (if build issues):
   ```bash
   npm uninstall @heroui/react framer-motion
   git checkout HEAD~1 tailwind.config.js package.json
   npm install
   sudo npm run build
   ```

3. **Nginx cache clear** (if users see stale build):
   ```bash
   # Hard refresh: Ctrl+Shift+R
   # Or clear browser cache
   ```

## Future Enhancements

### Phase 2: Input Components
- Replace `<input>` in `Login.tsx` with HeroUI `<Input>`
- Add built-in validation states (error, success)
- Use `startContent` prop for icons (cleaner than absolute positioning)

### Phase 3: Card Components
- Migrate service cards to HeroUI `<Card>` + `<CardBody>`
- Use `isPressable` prop for click interactions
- Add `Chip` for user badge (Admin/Invitado)

### Phase 4: Full HeroUI Theme
- Define complete theme in `tailwind.config.js` (not just primary)
- Use semantic color tokens: `success`, `warning`, `danger`
- Configure `borderRadius`, `fontSize` to match design system

## Dependencies

### NPM Packages
```json
{
  "@heroui/react": "^2.8.5",
  "framer-motion": "^11.15.0"
}
```

### Peer Dependencies (already satisfied)
- `react`: ^19.0.0 ✓ (19.1.1 installed)
- `react-dom`: ^19.0.0 ✓ (19.1.1 installed)
- `tailwindcss`: ^4.0.0 ✓ (4.1.14 installed)

### Build Tools
- Vite 7.1.7 ✓ (no changes needed)
- TypeScript 5.9.3 ✓ (HeroUI has full types)

## References

- [HeroUI Button API](https://www.heroui.com/docs/components/button)
- [HeroUI Theming Guide](https://www.heroui.com/docs/customization/theme)
- [Framer Motion Performance](https://www.framer.com/motion/performance/)
- [React Aria (HeroUI foundation)](https://react-spectrum.adobe.com/react-aria/)
