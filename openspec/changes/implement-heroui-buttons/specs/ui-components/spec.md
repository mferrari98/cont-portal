# UI Components Specification

## ADDED Requirements

### Requirement: HeroUI Library Integration
The portal MUST integrate HeroUI React component library to provide accessible, themeable UI components.

**Acceptance Criteria**:
- `@heroui/react` package installed at version ^2.8.5
- `framer-motion` peer dependency installed at version ^11.x
- Tailwind CSS configuration includes `heroui()` plugin
- HeroUI content paths added to `tailwind.config.js` content array
- Custom theme colors configured to match existing design system

#### Scenario: Package Installation
**Given** the project uses npm for package management
**When** installing HeroUI dependencies
**Then** `package.json` must list `@heroui/react@^2.8.5` and `framer-motion@^11.15.0`
**And** running `npm install` completes without errors
**And** TypeScript types are available for HeroUI components

#### Scenario: Tailwind Plugin Configuration
**Given** the project uses Tailwind CSS v4.1.14
**When** configuring the HeroUI plugin
**Then** `tailwind.config.js` imports `heroui` from `@heroui/react`
**And** the `plugins` array includes `heroui()` function call
**And** HeroUI theme defines `dark` and `light` color schemes
**And** primary color is set to `#EB5E28` in both themes

#### Scenario: Theme Color Mapping
**Given** the existing design uses specific color palette
**When** defining HeroUI theme colors
**Then** dark mode background is `#252422` (dark charcoal)
**And** dark mode foreground is `#FFFCF2` (cream white)
**And** light mode background is `#FFFCF2`
**And** light mode foreground is `#252422`
**And** primary color is `#EB5E28` with foreground `#FFFCF2` in both themes

---

### Requirement: HeroUI Provider Setup
The application MUST initialize HeroUIProvider to enable theme context for all HeroUI components.

**Acceptance Criteria**:
- `HeroUIProvider` wraps the root `<App />` component
- Provider is imported from `@heroui/react`
- All HeroUI components can access theme context
- No console errors related to missing provider

#### Scenario: Provider Wrapping
**Given** the app renders via `src/main.tsx`
**When** initializing the React root
**Then** `HeroUIProvider` must wrap `<App />`
**And** the provider is placed inside `<StrictMode>`
**And** running the app in dev mode shows no provider-related errors

---

### Requirement: Button Component Standardization
All interactive button elements MUST use HeroUI Button component with appropriate variants and sizes.

**Acceptance Criteria**:
- Login submit button uses `<Button color="primary" size="lg" fullWidth>`
- Guest access button uses `<Button variant="bordered" size="lg" fullWidth>`
- Theme toggle button uses `<Button isIconOnly variant="bordered" size="sm">`
- Logout button uses `<Button isIconOnly variant="bordered" size="sm">`
- All buttons import from `@heroui/react`
- No native HTML `<button>` elements remain in `Login.tsx` or `App.tsx`

#### Scenario: Login Submit Button
**Given** a user is on the login screen
**When** rendering the form submit button
**Then** the button uses HeroUI `<Button>` component
**And** has `type="submit"` to trigger form submission
**And** has `color="primary"` for orange background
**And** has `size="lg"` for 48px height
**And** has `fullWidth` to span container width
**And** displays text "Iniciar sesión"

#### Scenario: Guest Access Button
**Given** a user is on the login screen
**When** rendering the guest access button
**Then** the button uses HeroUI `<Button>` component
**And** has `type="button"` to prevent form submission
**And** has `variant="bordered"` for outlined appearance
**And** has `size="lg"` for consistent height with submit button
**And** has `fullWidth` to span container width
**And** has `onClick={handleGuest}` handler
**And** displays text "Continuar como invitado"

#### Scenario: Theme Toggle Icon Button
**Given** a user is logged into the portal
**When** rendering the theme toggle button in the top bar
**Then** the button uses HeroUI `<Button>` component
**And** has `isIconOnly` to remove text padding
**And** has `variant="bordered"` for outlined style
**And** has `size="sm"` for 32px dimensions
**And** has `onClick={toggleTheme}` handler
**And** contains Moon icon when dark mode active
**And** contains Sun icon when light mode active

#### Scenario: Logout Icon Button
**Given** a user is logged into the portal
**When** rendering the logout button in the top bar
**Then** the button uses HeroUI `<Button>` component
**And** has `isIconOnly` for icon-only appearance
**And** has `variant="bordered"` for outlined style
**And** has `size="sm"` for consistent size with theme toggle
**And** has `onClick={handleLogout}` handler
**And** has `title="Cerrar sesión"` for tooltip
**And** contains LogOut icon from lucide-react

---

### Requirement: Visual Consistency
HeroUI buttons MUST match the visual appearance of the original custom-styled buttons.

**Acceptance Criteria**:
- Button colors match existing palette exactly
- Button sizes maintain original dimensions (48px large, 32px small)
- Border widths are consistent (2px)
- Spacing and padding match original layout
- No visual regressions in layout or alignment

#### Scenario: Visual Regression Check
**Given** the original buttons use custom Tailwind classes
**When** replacing with HeroUI buttons
**Then** login button background is `#EB5E28` (orange)
**And** guest button has 2px border with cream color
**And** icon buttons are 32x32px (8 Tailwind units)
**And** large buttons have ~48px height
**And** button text color is `#FFFCF2` on dark backgrounds

---

### Requirement: Accessibility Standards
All buttons MUST meet WCAG 2.1 AA accessibility standards for keyboard navigation and screen readers.

**Acceptance Criteria**:
- Buttons are focusable via keyboard (Tab key)
- Buttons are activatable via Enter and Space keys
- Focus indicators are visible (outline or ring)
- ARIA attributes are present (role, aria-label, aria-pressed if applicable)
- Screen readers announce button purpose correctly

#### Scenario: Keyboard Navigation
**Given** a user navigates using only keyboard
**When** pressing Tab key on login screen
**Then** focus moves to username input
**And** pressing Tab again moves to password input
**And** pressing Tab again moves to login button
**And** pressing Enter activates the focused button
**And** pressing Space on logout button triggers logout

#### Scenario: Screen Reader Announcement
**Given** a user with a screen reader on the portal
**When** focusing the logout button
**Then** screen reader announces "Cerrar sesión, button"
**And** focusing theme toggle announces current state (e.g., "Toggle theme, button")
**And** all buttons have proper ARIA role="button"

---

### Requirement: Build Integration
The project MUST build successfully with HeroUI components and produce a working production bundle.

**Acceptance Criteria**:
- TypeScript compilation completes without errors (`tsc -b`)
- Vite build produces output in `/var/www/portal-servicios/dist/`
- Production bundle size increase is < 100KB gzipped
- No runtime errors in browser console

#### Scenario: Production Build
**Given** all HeroUI components are implemented
**When** running `sudo npm run build`
**Then** TypeScript compilation succeeds with exit code 0
**And** Vite bundling completes successfully
**And** output files are written to `dist/` directory
**And** bundle includes HeroUI and Framer Motion dependencies
**And** gzipped bundle size is under 200KB total

#### Scenario: Development Server
**Given** HeroUI is configured correctly
**When** running `npm run dev`
**Then** Vite dev server starts on port 5173
**And** no HeroUI-related errors appear in console
**And** hot module replacement works for button changes
**And** buttons render with correct styles in dev mode
