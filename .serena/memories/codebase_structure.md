# Codebase Structure

## Directory Layout
```
/var/www/portal-servicios/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.tsx
│   │   │   └── tooltip.tsx
│   │   └── Login.tsx        # Authentication component
│   ├── lib/
│   │   └── utils.ts         # Utility functions (clsx, tailwind-merge)
│   ├── assets/              # Static assets
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   ├── index.css            # Global styles with Tailwind imports
│   └── main.tsx             # Application entry point
├── public/                  # Public static assets
├── dist/                    # Production build output
├── .claude/                 # Claude Code configuration
├── openspec/                # OpenSpec specifications
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── components.json          # shadcn/ui configuration
├── tsconfig.json            # TypeScript configuration
├── postcss.config.js        # PostCSS configuration
├── CLAUDE.md                # AI assistant instructions
└── README.md                # Project documentation
```

## Key Files

### src/App.tsx
Main application component containing:
- Authentication state management
- Theme switching logic (dark/light mode)
- Service card grid rendering
- Role-based service filtering
- Logout functionality

### src/components/Login.tsx
Authentication UI with:
- Username/password form
- "Continue as guest" option
- Error message display
- Theme-aware styling

### src/components/ui/
shadcn/ui components following the Radix UI + Tailwind CSS pattern:
- Fully accessible (ARIA attributes, keyboard navigation)
- Type-safe with TypeScript
- Customizable via Tailwind classes
- Tree-shakeable imports

## Path Aliases
Configured in `vite.config.ts` and `tsconfig.app.json`:
- `@/` → `./src/`
- `@/components` → `./src/components`
- `@/lib` → `./src/lib`
- `@/ui` → `./src/components/ui`
