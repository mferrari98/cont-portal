# Implementation Tasks

## Phase 1: Installation & Configuration

- [x] **Install HeroUI packages**
  - Run: `npm install @heroui/react framer-motion`
  - Verify: `package.json` shows `@heroui/react@^2.8.5` and `framer-motion@^11.x`
  - Validation: `npm list @heroui/react framer-motion` shows installed versions

- [x] **Configure Tailwind CSS plugin**
  - Update `tailwind.config.js` to import and use `heroui` plugin
  - Add HeroUI content path to `content` array
  - Define custom theme colors for dark/light modes (primary: `#EB5E28`)
  - Validation: Run `npm run build` - should compile without Tailwind errors

- [x] **Wrap app with HeroUIProvider**
  - Import `HeroUIProvider` from `@heroui/react` in `src/main.tsx`
  - Wrap `<App />` component with `<HeroUIProvider>`
  - Validation: App renders without console errors

## Phase 2: Component Migration

- [x] **Replace login submit button** (`src/components/Login.tsx:95-100`)
  - Import `Button` from `@heroui/react`
  - Replace native `<button>` with `<Button type="submit" color="primary" size="lg" fullWidth>`
  - Remove custom Tailwind classes
  - Keep `type="submit"` attribute for form submission
  - Validation: Login form submits correctly on Enter and button click

- [x] **Replace guest access button** (`src/components/Login.tsx:114-120`)
  - Replace native `<button>` with `<Button variant="bordered" size="lg" fullWidth>`
  - Keep `type="button"` and `onClick={handleGuest}`
  - Validation: "Continuar como invitado" button navigates to guest view

- [x] **Replace theme toggle button** (`src/App.tsx:139-144`)
  - Replace native `<button>` with `<Button isIconOnly variant="bordered" size="sm">`
  - Keep `onClick={toggleTheme}` handler
  - Nest icon element inside Button component
  - Validation: Theme toggles between dark/light on click

- [x] **Replace logout button** (`src/App.tsx:147-153`)
  - Replace native `<button>` with `<Button isIconOnly variant="bordered" size="sm">`
  - Keep `onClick={handleLogout}` and `title="Cerrar sesión"`
  - Nest `<LogOut>` icon inside Button
  - Validation: Logout button clears session and returns to login screen

## Phase 3: Validation & Testing

- [x] **Type checking**
  - Run: `npm run build` (includes `tsc -b`)
  - Expected: No TypeScript errors
  - Fix any type issues with HeroUI Button props

- [x] **Production build**
  - Run: `sudo npm run build`
  - Expected: Build completes successfully, outputs to `/var/www/portal-servicios/dist/`
  - Check build size increase (should be < 100KB gzipped)

- [x] **Visual regression testing**
  - Compare new buttons to screenshots/design:
    - Login button: Orange background (#EB5E28), white text, full width
    - Guest button: Bordered, cream text, full width
    - Theme toggle: Icon-only, small, bordered
    - Logout: Icon-only, small, bordered
  - Ensure spacing, sizing, and colors match original design

- [x] **Functional testing**
  - [x] Login with admin/admin credentials → Dashboard loads with 6 services
  - [x] Login as guest → Dashboard loads with 3 services
  - [x] Click theme toggle → Background and text colors swap
  - [x] Click logout → Returns to login screen, localStorage cleared
  - [x] Keyboard navigation: Tab through buttons, activate with Enter/Space

- [x] **Accessibility audit**
  - Test keyboard-only navigation (no mouse)
  - Verify focus indicators are visible
  - Check ARIA attributes in DevTools (role="button", aria-pressed, etc.)
  - Test with screen reader (optional but recommended)

## Phase 4: Documentation

- [x] **Update CLAUDE.md**
  - Confirm HeroUI 2.8.5 is accurately listed in dependencies
  - Add section: "HeroUI Button Usage Examples"
  - Document Button variants used: `primary`, `bordered`, `isIconOnly`

- [x] **Update package.json comments** (if any)
  - Ensure HeroUI and framer-motion are listed with correct versions

## Dependencies Between Tasks
- **Sequential**: Phase 1 must complete before Phase 2 (can't use components without installation)
- **Sequential**: Phase 2 must complete before Phase 3 (can't test uncommitted code)
- **Parallel**: Within Phase 2, all 4 button replacements can be done in parallel
- **Parallel**: Within Phase 3, visual and functional testing can run concurrently

## Rollback Plan
If issues arise:
1. Revert component changes: `git checkout -- src/components/Login.tsx src/App.tsx`
2. Remove packages: `npm uninstall @heroui/react framer-motion`
3. Restore original `tailwind.config.js`
4. Rebuild: `sudo npm run build`
