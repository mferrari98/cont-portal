# Implementation Tasks: Migrate to HeroUI

## Phase 1: Setup & Configuration

### Task 1.1: Install HeroUI Package
- [x] Run `npm install @heroui/react` in `/var/www/portal-servicios/`
- [x] Verify installation in `package.json` (should add `@heroui/react` to dependencies)
- [x] Run `npm install` to ensure lockfile is updated
- [x] Verify no installation errors or peer dependency warnings

**Validation**: `npm list @heroui/react` shows installed version

---

### Task 1.2: Configure Tailwind with HeroUI Plugin
- [x] Open `tailwind.config.js`
- [x] Import HeroUI plugin: `import { heroui } from "@heroui/react"`
- [x] Add HeroUI to plugins array: `plugins: [heroui()]`
- [x] Add HeroUI content path: `"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"`
- [x] Set `darkMode: "class"` (verify it's present)
- [x] Save file

**Validation**: Run `npm run build` - build succeeds with no errors

---

### Task 1.3: Configure HeroUI Theme Colors
- [x] In `tailwind.config.js`, expand `heroui()` plugin to include theme configuration
- [x] Add dark theme colors:
  - `background: "#252422"`
  - `foreground: "#FFFCF2"`
  - `primary.DEFAULT: "#EB5E28"`
  - `primary.foreground: "#FFFCF2"`
- [x] Add light theme colors:
  - `background: "#FFFCF2"`
  - `foreground: "#252422"`
  - `primary.DEFAULT: "#EB5E28"` (same)
  - `primary.foreground: "#FFFCF2"` (same)
- [x] Save file

**Validation**: Colors match design.md specification

---

### Task 1.4: Add HeroUIProvider to App Root
- [x] Open `src/App.tsx`
- [x] Import `HeroUIProvider` from `@heroui/react`
- [x] Wrap the return JSX in `<HeroUIProvider>...</HeroUIProvider>`
- [x] Add `className={theme}` to the outer `<main>` or `<div>` to apply theme class
- [x] Save file

**Validation**: Run `npm run dev` - app starts without errors

---

### Task 1.5: Verify Build After Setup
- [x] Run `npm run build` (use `sudo npm run build` if permission issues)
- [x] Check build output in `dist/` folder - verify files exist
- [x] Check bundle size - should be < 100KB increase over current build
- [x] Run `npm run preview` - app loads correctly in browser
- [x] Verify no console errors in browser DevTools

**Validation**: Production build succeeds, app displays (with old components still present)

---

## Phase 2: Migrate Login Component

### Task 2.1: Update Login Component Imports
- [x] Open `src/components/Login.tsx`
- [x] Add import: `import { Input, Button, Card, CardBody } from "@heroui/react"`
- [x] Keep existing Lucide React imports: `Shield, Lock, User`
- [x] Save file

**Validation**: No TypeScript errors after save

---

### Task 2.2: Replace Username Input with HeroUI
- [x] Find the username `<input>` element in Login.tsx
- [x] Replace with:
  ```tsx
  <Input
    type="text"
    label="Usuario"
    variant="bordered"
    placeholder="Ingresa tu usuario"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    startContent={<User className="h-5 w-5 text-[#FFFCF2]/50" />}
    classNames={{
      input: "text-base",
      inputWrapper: "border-2 border-[#FFFCF2]/30"
    }}
  />
  ```
- [x] Remove the old `<label>`, `<div className="relative">`, and `<input>` for username
- [x] Remove the absolute-positioned icon wrapper div
- [x] Save file

**Validation**: `npm run dev` - username input renders and accepts text input

---

### Task 2.3: Replace Password Input with HeroUI
- [x] Find the password `<input>` element in Login.tsx
- [x] Replace with:
  ```tsx
  <Input
    type="password"
    label="Contraseña"
    variant="bordered"
    placeholder="Ingresa tu contraseña"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    startContent={<Lock className="h-5 w-5 text-[#FFFCF2]/50" />}
    classNames={{
      input: "text-base",
      inputWrapper: "border-2 border-[#FFFCF2]/30"
    }}
  />
  ```
- [x] Remove the old `<label>`, `<div className="relative">`, and `<input>` for password
- [x] Remove the absolute-positioned icon wrapper div
- [x] Save file

**Validation**: Password input renders and masks characters

---

### Task 2.4: Replace Login Buttons with HeroUI
- [x] Find the login submit `<button>` (orange background)
- [x] Replace with:
  ```tsx
  <Button
    type="submit"
    color="warning"
    className="w-full"
    size="lg"
  >
    Iniciar sesión
  </Button>
  ```
- [x] Find the guest `<button>` (bordered)
- [x] Replace with:
  ```tsx
  <Button
    type="button"
    variant="bordered"
    onClick={handleGuest}
    className="w-full"
    size="lg"
  >
    Continuar como invitado
  </Button>
  ```
- [x] Save file

**Validation**: Both buttons render correctly and trigger appropriate actions

---

### Task 2.5: Update Error Message Display
- [x] Find the error message `<div>` (conditional render: `{error && ...}`)
- [x] Keep the existing div structure OR optionally wrap in HeroUI styling
- [x] Ensure error text color is `text-[#EB5E28]` for visibility
- [x] Verify error border uses `border-[#EB5E28]`
- [x] Save file

**Validation**: Submit wrong credentials - error message displays correctly

---

### Task 2.6: Wrap Login Card with HeroUI Card
- [x] Find the outer card `<div className="bg-[#252422] border-2...">` containing the form
- [x] Replace with:
  ```tsx
  <Card className="bg-[#252422] border-2 border-[#FFFCF2]/30">
    <CardBody className="p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* form contents */}
      </form>
      {/* divider and guest button */}
    </CardBody>
  </Card>
  ```
- [x] Save file

**Validation**: Login card renders with correct styling

---

### Task 2.7: Test Login Flow End-to-End
- [x] Open app in browser (`npm run dev`)
- [x] Enter username: "admin", password: "admin"
- [x] Click "Iniciar sesión" - verify successful login
- [x] Logout
- [x] Click "Continuar como invitado" - verify guest login
- [x] Verify localStorage contains `portal_user` key
- [x] Test with keyboard only (Tab navigation, Enter to submit)

**Validation**: Login flow works identically to original implementation

---

## Phase 3: Migrate Main Dashboard

### Task 3.1: Update App Component Imports
- [x] Open `src/App.tsx`
- [x] Add import: `import { Card, CardBody, Button, Chip } from "@heroui/react"`
- [x] Keep existing Lucide React icon imports
- [x] Save file

**Validation**: No TypeScript errors

---

### Task 3.2: Replace Service Cards with HeroUI
- [x] Find the service card mapping section (around line 173)
- [x] For each service, replace the `<a>` + `<div>` structure with:
  ```tsx
  <Card
    isPressable
    as="a"
    href={service.url}
    className="border-[#FFFCF2]/20 hover:border-[#FFFCF2]/40 transition-colors"
  >
    <CardBody className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-md border flex items-center justify-center flex-shrink-0 bg-[#FFFCF2]/5 border-[#FFFCF2]/10">
          <div className="text-[#FFFCF2]">
            {service.icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-medium mb-2 text-[#FFFCF2]">
            {service.name}
          </h3>
          <p className="text-sm leading-relaxed text-[#FFFCF2]/70">
            {service.desc}
          </p>
        </div>
      </div>
    </CardBody>
  </Card>
  ```
- [x] Remove the old `<a>` wrapper and inner `<div>` structure
- [x] Save file

**Validation**: Service cards render in 3-column grid with correct spacing

---

### Task 3.3: Replace Top Bar Buttons with HeroUI
- [x] Find the theme toggle `<button>` (Moon/Sun icon)
- [x] Replace with:
  ```tsx
  <Button
    isIconOnly
    variant="bordered"
    onClick={toggleTheme}
    className="w-8 h-8"
    size="sm"
  >
    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
  </Button>
  ```
- [x] Find the logout `<button>` (LogOut icon)
- [x] Replace with:
  ```tsx
  <Button
    isIconOnly
    variant="bordered"
    onClick={handleLogout}
    className="w-8 h-8"
    size="sm"
    title="Cerrar sesión"
  >
    <LogOut className="w-4 h-4" />
  </Button>
  ```
- [x] Save file

**Validation**: Top bar buttons render correctly and trigger actions

---

### Task 3.4: Update User Badge with HeroUI Chip
- [x] Find the user badge `<div>` (displays "Admin" or "Invitado")
- [x] Replace with:
  ```tsx
  <Chip
    startContent={<User className="w-3.5 h-3.5" />}
    variant="bordered"
    className="border-[#FFFCF2]/20"
  >
    {user === 'admin' ? 'Admin' : 'Invitado'}
  </Chip>
  ```
- [x] Remove the old `<div>` structure
- [x] Save file

**Validation**: User badge displays role correctly

---

### Task 3.5: Test Dashboard Interactions
- [x] Login as admin user
- [x] Verify all 6 service cards display
- [x] Click each service card - verify navigation works
- [x] Click theme toggle - verify dark/light theme switches
- [x] Click logout - verify session clears and returns to login
- [x] Login as guest - verify only 3 service cards display
- [x] Test keyboard navigation (Tab through cards, Enter to navigate)

**Validation**: Dashboard works identically to original

---

## Phase 4: Theme & Polish

### Task 4.1: Verify Theme Switching Logic
- [x] Open `src/App.tsx`
- [x] Verify theme state is applied to parent element: `<main className={theme}>`
- [x] Verify HeroUIProvider is present and wraps app content
- [x] Test theme toggle button - verify localStorage updates
- [x] Refresh browser - verify theme persists across reload

**Validation**: Theme persists and applies correctly to all HeroUI components

---

### Task 4.2: Adjust Spacing and Sizing
- [x] Compare current HeroUI implementation to original design
- [x] Adjust card padding if needed (currently `p-6`)
- [x] Adjust button sizes if needed (currently using `size="sm"` and `size="lg"`)
- [x] Verify service grid gap is consistent (`gap-6`)
- [x] Verify top bar spacing matches original (`py-4`, `gap-2`)

**Validation**: Visual appearance matches original design pixel-perfectly

---

### Task 4.3: Disable Unnecessary Animations (Optional)
- [x] If animations feel too prominent, add to `tailwind.config.js`:
  ```js
  heroui({
    themes: { /* existing theme config */ },
    defaultTheme: "dark",
    layout: {
      disabledOpacity: "0.3",
      radius: {
        small: "0.375rem",
        medium: "0.5rem",
        large: "0.75rem",
      }
    }
  })
  ```
- [x] Test if this reduces motion to match original static feel
- [x] If animations are acceptable, skip this customization

**Validation**: Animations match user preference (ask for feedback)

---

### Task 4.4: Test Accessibility
- [x] Test keyboard-only navigation (no mouse):
  - [x] Tab through login form
  - [x] Tab through service cards
  - [x] Tab through top bar buttons
  - [x] Press Enter/Space to activate elements
- [x] Test with screen reader (if available):
  - [x] Verify form labels are announced
  - [x] Verify button purposes are clear
  - [x] Verify service cards are navigable
- [x] Run browser accessibility audit (DevTools > Lighthouse):
  - [x] Accessibility score should be 95+

**Validation**: All interactive elements are keyboard and screen-reader accessible

---

## Phase 5: Cleanup & Documentation

### Task 5.1: Remove Unused Code
- [x] Search for unused Tailwind classes that were replaced by HeroUI props
- [x] Remove any commented-out old component code
- [x] Verify no dead imports remain (HeroUI components should be actively used)
- [x] Clean up `themeClasses` object in App.tsx if no longer needed

**Validation**: No linting warnings or unused variables

---

### Task 5.2: Update CLAUDE.md Documentation
- [x] Open `CLAUDE.md`
- [x] Replace "Shadcn UI components (New York style)" with "HeroUI (previously NextUI)"
- [x] Update "Current Components" section to list HeroUI components:
  - Input, Button, Card, CardBody, Chip
- [x] Update "Adding New Components" section:
  ```bash
  npm install @heroui/[component-name]
  # or import from @heroui/react
  ```
- [x] Remove Shadcn-specific references (components.json, path aliases for ui folder)
- [x] Add section about HeroUI theming configuration

**Validation**: Documentation accurately reflects new architecture

---

### Task 5.3: Update openspec/project.md
- [x] Open `openspec/project.md`
- [x] Update Tech Stack section to replace Shadcn with HeroUI
- [x] Update Code Style section to mention HeroUI component props
- [x] Update Architecture Patterns to mention HeroUIProvider
- [x] Save file

**Validation**: Project documentation is current

---

### Task 5.4: Remove components.json (Shadcn Config)
- [x] Check if `components.json` exists in project root
- [x] If present and only used for Shadcn, delete the file
- [x] If it contains other config, remove only Shadcn-related sections
- [x] Verify build still succeeds after removal

**Validation**: No references to Shadcn tooling remain

---

### Task 5.5: Final Production Build
- [x] Run `sudo npm run build` (elevated permissions for /var/www/)
- [x] Verify build succeeds with no errors
- [x] Check `dist/` folder - verify files are generated
- [x] Check bundle size - compare to original build
  - [x] Should be +80KB or less (gzipped)
- [x] Run `npm run preview` - test production build locally
- [x] Hard refresh browser to clear cache (`Ctrl+Shift+R`)

**Validation**: Production build works correctly

---

### Task 5.6: Deploy to Production
- [x] SSH into server (if remote deployment)
- [x] Navigate to `/var/www/portal-servicios/`
- [x] Pull latest changes (if using git) OR copy built files
- [x] Verify Nginx is serving from `/var/www/portal-servicios/dist/`
- [x] Test live URL: https://10.10.9.252/
- [x] Test login flow in production
- [x] Test service navigation in production
- [x] Test theme toggle in production

**Validation**: Production site works identically to local preview

---

## Rollback Plan

If critical issues are discovered after deployment:

### Rollback Task R.1: Restore Previous Version
- [x] If using git: `git revert [commit-hash]` and rebuild
- [x] If no git: Restore backup files from before migration
- [x] Run `sudo npm run build` to rebuild with old code
- [x] Deploy restored build to production

### Rollback Task R.2: Uninstall HeroUI
- [x] Run `npm uninstall @heroui/react`
- [x] Revert `tailwind.config.js` to previous version
- [x] Remove `HeroUIProvider` from `App.tsx`
- [x] Rebuild and redeploy

**Validation**: Application returns to pre-migration state

---

## Success Metrics

After all tasks are completed, verify:
- ✅ All login flows work (admin, guest, validation errors)
- ✅ All service cards are clickable and navigate correctly
- ✅ Theme toggle switches between dark/light
- ✅ User badge displays correct role
- ✅ Logout clears session
- ✅ Keyboard navigation works throughout
- ✅ Build size increase < 100KB
- ✅ No TypeScript errors
- ✅ No console errors in production
- ✅ Documentation updated
