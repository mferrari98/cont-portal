# Authentication UI

## MODIFIED Requirements

### Requirement: Login Form Interface
The login form SHALL use HeroUI components while maintaining existing authentication logic.

#### Scenario: Render login form with HeroUI components
**Given** the user is not authenticated
**When** the login screen is displayed
**Then** the form uses HeroUI `<Card>` as the container
**And** the username field uses HeroUI `<Input>` with User icon
**And** the password field uses HeroUI `<Input type="password">` with Lock icon
**And** the submit button uses HeroUI `<Button color="warning">`
**And** the guest button uses HeroUI `<Button variant="bordered">`

#### Scenario: Login form submission
**Given** the user enters username "admin" and password "admin"
**When** the user clicks the "Iniciar sesión" button
**Then** the form calls `handleSubmit(e)` (unchanged logic)
**And** the authentication validates credentials (unchanged)
**And** on success, `onLogin("admin")` is called
**And** `localStorage.setItem('portal_user', 'admin')` persists the session

#### Scenario: Login validation error display
**Given** the user enters incorrect credentials
**When** the form is submitted
**Then** the error state is set to "Usuario o contraseña incorrectos"
**And** the error is displayed below the password field
**And** the error uses HeroUI's validation styling with `danger` color
**And** the error message is screen-reader accessible

---

### Requirement: Guest Access Flow
The guest login button SHALL provide unauthenticated access to limited services.

#### Scenario: Guest button interaction
**Given** the login screen is displayed
**When** the user clicks "Continuar como invitado"
**Then** the `handleGuest()` function is called (unchanged logic)
**And** `onLogin("invitado")` is called
**And** `localStorage.setItem('portal_user', 'invitado')` persists the session
**And** the user sees only the first 3 services (guardias, reportes, dash)

#### Scenario: Guest button styling
**Given** the guest button is rendered below the login form
**When** the button is displayed
**Then** it uses HeroUI `<Button variant="bordered">` for outlined appearance
**And** the button has lower visual priority than the primary login button
**And** the button is full-width to match the login button

---

### Requirement: Login Screen Header
The login screen header SHALL use HeroUI Card for visual consistency.

#### Scenario: Display login header
**Given** the login screen is rendered
**When** the header section is displayed
**Then** the header contains a Shield icon centered in a bordered container
**And** the title "Portal de Servicios" is displayed prominently
**And** the subtitle "Telecomunicaciones y Automatismos" is displayed below
**And** all text uses the current dark theme colors (white text on dark background)

## REMOVED Requirements

### Requirement: Custom Input Icon Positioning
The login form inputs SHALL NOT use manual absolute positioning for icons.

#### Scenario: Remove custom icon wrapper divs
**Given** the Login component previously used `<div className="absolute inset-y-0 left-0...">` for icons
**When** HeroUI Input components are implemented
**Then** icon positioning divs are removed
**And** icons are passed via the `startContent` prop
**And** HeroUI handles icon spacing and alignment automatically
