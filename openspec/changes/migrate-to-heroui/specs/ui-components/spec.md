# UI Components

## ADDED Requirements

### Requirement: HeroUI Component Library Integration
The application SHALL use HeroUI (previously NextUI) as the primary UI component library for all interactive elements.

#### Scenario: Install and configure HeroUI
**Given** the project uses React 19 with Vite 7 and Tailwind CSS v4
**When** HeroUI is installed via `npm i @heroui/react`
**Then** the HeroUI Tailwind plugin is configured in `tailwind.config.js`
**And** the `HeroUIProvider` wraps the root application component
**And** HeroUI theme content paths are included in Tailwind's content array

#### Scenario: Import HeroUI components
**Given** HeroUI is installed and configured
**When** a developer needs a UI component (Button, Input, Card, etc.)
**Then** they import it from `@heroui/react` (e.g., `import { Button } from "@heroui/react"`)
**And** the component is tree-shaken to minimize bundle size
**And** TypeScript provides full type safety and autocomplete

---

### Requirement: Service Card Components
Service cards SHALL be implemented using HeroUI's Card component with pressable interaction.

#### Scenario: Render service cards
**Given** the user is logged in and viewing the dashboard
**When** the service grid is rendered
**Then** each service uses the HeroUI `<Card>` component
**And** the card has `isPressable={true}` for interactive feedback
**And** the card renders as an anchor tag via `as="a"` with `href={service.url}`
**And** the card contains a `<CardBody>` with service icon, name, and description

#### Scenario: Service card interaction
**Given** a service card is displayed
**When** the user hovers over the card
**Then** the card displays a subtle hover state (border opacity increase)
**When** the user clicks the card
**Then** the browser navigates to the service URL
**And** keyboard users can activate the card with Enter or Space key

---

### Requirement: Button Components
All button elements SHALL use HeroUI's Button component with appropriate variants.

#### Scenario: Icon-only buttons (theme toggle, logout)
**Given** the top bar contains icon-only action buttons
**When** the button is rendered
**Then** it uses `<Button isIconOnly variant="bordered">`
**And** the button has a fixed size matching the current 8x8px design
**And** the button displays the appropriate Lucide React icon
**And** the button has hover and focus states for accessibility

#### Scenario: Primary action button (login)
**Given** the login form contains a submit button
**When** the button is rendered
**Then** it uses `<Button type="submit" color="warning">` (orange accent)
**And** the button spans the full width of the form
**And** the button text is "Iniciar sesión"
**And** the button is keyboard accessible (Enter key submits form)

#### Scenario: Secondary action button (guest login)
**Given** the login form contains a guest access button
**When** the button is rendered
**Then** it uses `<Button variant="bordered">`
**And** the button spans the full width of the form
**And** the button text is "Continuar como invitado"
**And** clicking the button triggers guest login without form validation

---

### Requirement: Input Components
Form input fields SHALL use HeroUI's Input component with validation support.

#### Scenario: Username input field
**Given** the login form is displayed
**When** the username input is rendered
**Then** it uses `<Input variant="bordered" label="Usuario">`
**And** the input has a User icon as `startContent`
**And** the input placeholder is "Ingresa tu usuario"
**And** the input is controlled by React state (`value={username}`)

#### Scenario: Password input field
**Given** the login form is displayed
**When** the password input is rendered
**Then** it uses `<Input type="password" variant="bordered" label="Contraseña">`
**And** the input has a Lock icon as `startContent`
**And** the input placeholder is "Ingresa tu contraseña"
**And** the password is masked with bullet characters

#### Scenario: Input validation error
**Given** the user submits invalid login credentials
**When** the error state is set
**Then** a validation message is displayed using HeroUI's inline validation
**And** the message text is "Usuario o contraseña incorrectos"
**And** the message uses the `danger` color variant (red/orange)

## MODIFIED Requirements

### Requirement: Component File Structure
Component imports SHALL use HeroUI instead of custom inline components.

#### Scenario: Update Login component imports
**Given** the `src/components/Login.tsx` file exists
**When** the component is refactored for HeroUI
**Then** the file imports `{ Input, Button, Card, CardBody }` from `@heroui/react`
**And** the file removes custom input styling classes
**And** the file maintains existing Lucide React icon imports

#### Scenario: Update App component imports
**Given** the `src/App.tsx` file exists
**When** the component is refactored for HeroUI
**Then** the file imports `{ Card, CardBody, Button, Chip }` from `@heroui/react`
**And** the file removes manual `<div>` wrappers for cards
**And** the file maintains existing state management logic

## REMOVED Requirements

### Requirement: Custom Inline Component Styling
The application SHALL NOT use manual Tailwind classes for complex interactive components.

#### Scenario: Remove custom input styling
**Given** the Login component previously used custom `<input>` elements
**When** HeroUI Input components are implemented
**Then** classes like `pl-11 pr-4 py-3 bg-[#252422] border-2...` are removed
**And** styling is controlled via HeroUI's `classNames` prop where needed
**And** accessibility attributes are automatically handled by HeroUI

#### Scenario: Remove custom button styling
**Given** the App component previously used custom `<button>` elements
**When** HeroUI Button components are implemented
**Then** classes for hover states (`hover:bg-[#2d2926]`) are removed
**And** interactive states are handled by HeroUI's built-in variants
**And** focus rings and keyboard navigation are automatic
