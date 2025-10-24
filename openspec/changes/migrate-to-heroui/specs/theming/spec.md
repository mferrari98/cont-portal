# Theming

## MODIFIED Requirements

### Requirement: Dark and Light Theme Support
The application SHALL support both dark and light themes using HeroUI's theme system integrated with Tailwind CSS.

#### Scenario: Configure HeroUI theme colors
**Given** the Tailwind CSS config file exists at `tailwind.config.js`
**When** the HeroUI plugin is added
**Then** the config includes `heroui()` in the plugins array
**And** the dark theme colors match the existing palette:
  - background: `#252422` (dark beige)
  - foreground: `#FFFCF2` (cream white)
  - primary: `#EB5E28` (orange accent)
**And** the light theme colors are inverted:
  - background: `#FFFCF2`
  - foreground: `#252422`
  - primary: `#EB5E28` (same accent)

#### Scenario: Apply theme to application
**Given** the user has selected a theme preference (dark or light)
**When** the theme state changes in React
**Then** the root `<main>` element receives the `dark` or `light` class
**And** HeroUI components automatically apply the corresponding theme colors
**And** the theme preference persists in `localStorage` as `portal_theme`

#### Scenario: Theme toggle button
**Given** the user is logged in and viewing the dashboard
**When** the theme toggle button in the top bar is clicked
**Then** the theme switches between dark and light
**And** the button icon changes between Moon (dark) and Sun (light)
**And** all HeroUI components re-render with the new theme colors
**And** the change is immediate without page refresh

---

### Requirement: Tailwind Content Configuration
The Tailwind CSS configuration SHALL include HeroUI's component paths for proper style generation.

#### Scenario: Configure content paths
**Given** the `tailwind.config.js` file exists
**When** HeroUI is installed
**Then** the `content` array includes `"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"`
**And** existing content paths remain (`"./index.html"`, `"./src/**/*.{js,ts,jsx,tsx}"`)
**And** HeroUI component styles are included in the production build

#### Scenario: Dark mode class strategy
**Given** the Tailwind config is updated for HeroUI
**When** the config is finalized
**Then** `darkMode: "class"` is set (not media query strategy)
**And** theme switching is controlled by JavaScript, not OS preference
**And** the theme persists across browser sessions

## ADDED Requirements

### Requirement: HeroUIProvider Root Wrapper
The application root SHALL be wrapped with HeroUIProvider for theme context.

#### Scenario: Add HeroUIProvider to App.tsx
**Given** the `src/App.tsx` component is the root component
**When** HeroUI integration is implemented
**Then** the App component returns JSX wrapped in `<HeroUIProvider>`
**And** the provider has no required props (uses defaults)
**And** all child components can access HeroUI theme context

#### Scenario: Verify theme context availability
**Given** HeroUIProvider wraps the application
**When** a HeroUI component is rendered anywhere in the tree
**Then** the component receives theme values from the provider
**And** the component automatically applies dark/light styles based on parent class

## REMOVED Requirements

### Requirement: Manual CSS Custom Property Theme Switching
The application SHALL NOT use manual CSS custom property manipulation for theming.

#### Scenario: Remove inline style theme application
**Given** the App component previously used `document.documentElement.style.setProperty()`
**When** HeroUI theme system is implemented
**Then** the `applyTheme()` function is removed (no longer in current code)
**And** theme switching uses class-based strategy (`dark` class on parent)
**And** HeroUI handles all theme color application automatically

#### Scenario: Remove hardcoded theme classes
**Given** components previously used hardcoded theme classes like `bg-[#252422]`
**When** HeroUI components are used
**Then** theme colors reference HeroUI's semantic tokens (`bg-background`, `text-foreground`)
**And** manual color classes are only used for customization, not primary theming
**And** the same component code works for both dark and light themes
