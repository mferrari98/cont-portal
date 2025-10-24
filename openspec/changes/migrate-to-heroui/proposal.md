# Migrate to HeroUI Component Library

## Summary
Replace custom Tailwind CSS components with HeroUI (previously NextUI) component library to provide a more polished, accessible, and maintainable UI across the portal. This migration will standardize all interactive elements (buttons, inputs, cards, etc.) using HeroUI's pre-built components while maintaining the current minimalist dark/light theme aesthetic.

## Problem Statement
Currently, the portal uses custom-built components with inline Tailwind CSS classes, which:
- Requires manual accessibility implementation (ARIA attributes, keyboard navigation, focus management)
- Leads to inconsistent styling patterns across components
- Increases maintenance burden when adding new UI features
- Lacks built-in responsive behaviors and animations
- Makes it harder to ensure cross-browser compatibility

The project documentation mentions Shadcn UI components, but none are actually installed or used - the codebase only uses custom components.

## Proposed Solution
Migrate all UI components to HeroUI, a modern React UI library built on Tailwind CSS that provides:
- 50+ accessible components with React Aria foundation
- Built-in dark/light theme support
- TypeScript-first API with full type safety
- Customizable theming via Tailwind CSS plugin
- Zero runtime CSS-in-JS overhead (pure Tailwind)

### Specific Changes
1. **Install HeroUI** (`@heroui/react`) and its Tailwind plugin
2. **Replace service cards** with HeroUI `Card` component + `Button` for clickable areas
3. **Replace login form** with HeroUI `Input`, `Button` components
4. **Replace top bar elements** with HeroUI `Button`, `Badge`, `Avatar` components
5. **Configure HeroUI theme** to match current color palette:
   - Dark: `#252422` (bg), `#FFFCF2` (text), `#EB5E28` (accent)
   - Light: `#FFFCF2` (bg), `#252422` (text), `#EB5E28` (accent)
6. **Remove Shadcn references** from documentation (not installed in code)

## Benefits
- **Accessibility**: Built-in ARIA attributes, keyboard navigation, screen reader support
- **Consistency**: Unified component API and styling patterns
- **Maintainability**: Fewer custom components to maintain
- **Developer Experience**: TypeScript types, better IDE autocomplete
- **Performance**: No additional runtime overhead (still pure Tailwind)
- **Future-proof**: Active maintenance and regular updates from HeroUI team

## Risks & Mitigation
| Risk | Mitigation |
|------|------------|
| Bundle size increase | HeroUI is tree-shakeable; only import needed components |
| Learning curve | HeroUI API is similar to existing component patterns |
| Theme customization complexity | HeroUI uses Tailwind plugin for theming (familiar pattern) |
| Breaking changes in future versions | Pin to specific version, test updates in staging |

## Out of Scope
- Backend authentication system (remains client-side)
- Nginx configuration changes
- Service integrations or URLs
- Build/deployment process changes
- Adding new features beyond UI component replacement

## Success Criteria
- [ ] All interactive elements use HeroUI components
- [ ] Dark/light theme works identically to current implementation
- [ ] No visual regressions (same layout, spacing, colors)
- [ ] Build size increase < 100KB (gzipped)
- [ ] All components pass accessibility audit (ARIA, keyboard nav)
- [ ] TypeScript compilation with no errors
- [ ] Production build succeeds and deploys correctly

## Dependencies
- Requires Tailwind CSS v4 (already installed)
- Compatible with React 19 (already installed)
- Compatible with Vite 7 (already installed)

## Timeline Estimate
- Setup & configuration: 1-2 hours
- Component migration: 2-3 hours
- Theme customization: 1 hour
- Testing & validation: 1 hour
- **Total**: ~5-7 hours

## Related Changes
None - this is a standalone UI migration.

## References
- HeroUI Documentation: https://www.heroui.com/
- Vite Integration Guide: https://www.heroui.com/docs/frameworks/vite
- Component Gallery: https://www.heroui.com/components
