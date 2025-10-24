# Authentication System

## Overview
Client-side only authentication with NO backend validation. Suitable for internal/demo use only.

## Credentials
Hardcoded in `src/components/Login.tsx:23-27`:
```typescript
Username: admin
Password: admin
```

## User Roles

### Admin User
- Username: `admin`
- Password: `admin`
- Access: All 6 services (guardias, reportes, dash, gis, monitor, sitio2)
- localStorage key: `portal_user` = `"admin"`

### Guest User
- No credentials required (click "Continuar como invitado")
- Access: Only first 3 services (guardias, reportes, dash)
- localStorage key: `portal_user` = `"invitado"`

## Session Storage

### Stored Data
```typescript
localStorage.setItem('portal_user', 'admin' | 'invitado')
localStorage.setItem('portal_theme', 'dark' | 'light')
```

### Session Persistence
Session persists until:
- User clicks logout button
- Browser cache is cleared
- User manually clears localStorage

## Role-Based Service Filtering

### Implementation (App.tsx:120)
```typescript
const services = user === 'admin' ? allServices : allServices.slice(0, 3)
```

### Service Visibility
```typescript
// All services defined in App.tsx:29-68
const allServices: Service[] = [
  { id: 'guardias', ... },      // index 0 - visible to all
  { id: 'reportes', ... },      // index 1 - visible to all
  { id: 'dash', ... },          // index 2 - visible to all
  { id: 'gis', ... },           // index 3 - admin only
  { id: 'monitor', ... },       // index 4 - admin only
  { id: 'sitio2', ... },        // index 5 - admin only
]

// Guest users see: allServices.slice(0, 3)
// Admin users see: allServices (all 6)
```

## Login Flow

### 1. User Submits Form
```typescript
handleSubmit(e: React.FormEvent)
```
- Prevents default form submission
- Clears previous error messages
- Validates username/password match
- Calls `onLogin("admin")` if valid
- Shows error message if invalid

### 2. Guest Access
```typescript
handleGuest()
```
- Directly calls `onLogin("invitado")`
- No credentials required
- Immediate access to limited services

### 3. Parent Component (App.tsx)
```typescript
const handleLogin = (username: string) => {
  setUser(username)
  localStorage.setItem('portal_user', username)
}
```
- Sets user state
- Persists to localStorage
- Triggers re-render with service filtering

## Logout Flow

### Implementation (App.tsx)
```typescript
const handleLogout = () => {
  setUser(null)
  localStorage.removeItem('portal_user')
}
```
- Clears user state
- Removes from localStorage
- Redirects to login screen

## Security Considerations

### WARNING
- **NO server-side validation**
- **NO password hashing**
- **NO session management**
- **Credentials visible in source code**

### Appropriate Use Cases
- Internal corporate portals (trusted network)
- Demo/prototype applications
- Development environments
- Non-sensitive data access

### NOT Suitable For
- Public-facing applications
- Applications with sensitive data
- Production systems with security requirements
- Applications requiring audit trails

## Modification Guide

### Change Credentials
Edit `src/components/Login.tsx:23`:
```typescript
if (username === "admin" && password === "admin") {
  onLogin("admin")
}
```

### Add New Role
1. Update Login.tsx to set new role
2. Modify service filtering logic in App.tsx
3. Update localStorage handling

### Change Guest Service Count
Edit `src/App.tsx:120`:
```typescript
// Current: guests see first 3 services
const services = user === 'admin' ? allServices : allServices.slice(0, 3)

// Example: guests see first 4 services
const services = user === 'admin' ? allServices : allServices.slice(0, 4)
```

## Testing Authentication

### Test Cases
1. **Valid admin login**: Should grant access to all 6 services
2. **Invalid credentials**: Should show error message
3. **Guest access**: Should grant access to first 3 services
4. **Logout**: Should return to login screen
5. **Session persistence**: Refresh page, should stay logged in
6. **Theme persistence**: Change theme, refresh, should remember preference
