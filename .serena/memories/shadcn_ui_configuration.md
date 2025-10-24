# shadcn/ui Configuration

## Overview
This project uses shadcn/ui - a collection of reusable components built on Radix UI and Tailwind CSS.

## Installation Status
✅ **shadcn/ui is fully configured and operational**

## Configuration Files

### components.json
Location: `/var/www/portal-servicios/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Key Settings**:
- Style: `new-york` (minimalist, clean design)
- TypeScript: Enabled (tsx: true)
- CSS Variables: Enabled for theming
- No prefix for Tailwind classes

### tailwind.config.js
Standard shadcn/ui configuration with:
- Dark mode: class-based (`darkMode: ["class"]`)
- Extended colors using HSL CSS variables
- Custom border radius variables
- Content paths for React components

### src/lib/utils.ts
Utility function for merging classes:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Installed Components

Current components in `src/components/ui/`:
- `button.tsx` - Button component with variants
- `card.tsx` - Card, CardContent, CardHeader components
- `input.tsx` - Input component with label support
- `badge.tsx` - Badge/chip component
- `separator.tsx` - Horizontal/vertical separator
- `tooltip.tsx` - Tooltip with Radix UI

## Adding New Components

### Using CLI
```bash
npx shadcn@latest add <component-name>
```

Examples:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add select
```

### Interactive Mode
```bash
npx shadcn@latest add
# Shows list of available components to choose from
```

### After Adding Component
1. Component file created in `src/components/ui/`
2. Dependencies auto-installed if needed
3. Import and use in your components:
   ```typescript
   import { ComponentName } from "@/components/ui/component-name"
   ```

## Component Usage

### Button
```typescript
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Card
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Input
```typescript
import { Input } from "@/components/ui/input"

<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Badge
```typescript
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
```

### Tooltip
```typescript
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Theming

### CSS Variables
Defined in `src/index.css`:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    /* ... more variables */
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    /* ... more variables */
  }
}
```

### Applying Dark Mode
```typescript
// Add 'dark' class to html element
document.documentElement.classList.add('dark')

// Remove for light mode
document.documentElement.classList.remove('dark')
```

### Customizing Colors
Edit CSS variables in `src/index.css` or use Tailwind's extend in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
    },
  },
}
```

## Component Customization

### Via className
```typescript
<Button className="bg-orange-500 hover:bg-orange-600">
  Custom Color
</Button>
```

### Via CSS Variables
```typescript
<Button style={{ "--primary": "20 14% 4%" }}>
  Custom Theme
</Button>
```

### Create Variants
Modify component files in `src/components/ui/` to add new variants using `class-variance-authority`.

## Dependencies

### Required Packages
```json
{
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-tooltip": "^1.2.8",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1"
}
```

### Auto-Installed
When adding components, shadcn CLI will automatically install required Radix UI primitives.

## Best Practices

### Use cn() for Conditional Classes
```typescript
import { cn } from "@/lib/utils"

<Button className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
  Button
</Button>
```

### Maintain Accessibility
- All shadcn components include ARIA attributes
- Keyboard navigation built-in
- Screen reader support
- Don't remove accessibility features when customizing

### Type Safety
- All components are fully typed
- Use TypeScript for props
- Leverage IntelliSense

### Component Composition
```typescript
// Instead of creating new components, compose existing ones
<Card>
  <CardContent className="flex items-center gap-4">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </CardContent>
</Card>
```

## Troubleshooting

### Component Not Found
```bash
# Verify component is installed
ls src/components/ui/

# Install if missing
npx shadcn@latest add <component-name>
```

### Import Errors
Check path aliases in:
- `vite.config.ts` (resolve.alias)
- `tsconfig.app.json` (compilerOptions.paths)

### Styling Issues
- Verify Tailwind CSS is processing the component files
- Check `content` paths in `tailwind.config.js`
- Ensure PostCSS is configured correctly

### Dark Mode Not Working
- Verify 'dark' class on html element
- Check CSS variables in `src/index.css`
- Ensure `darkMode: ["class"]` in `tailwind.config.js`
