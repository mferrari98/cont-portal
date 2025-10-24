# Suggested Commands

## Development Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
# Runs on http://localhost:5173 with hot reload
```

### Build for Production
```bash
# IMPORTANT: Must run with sudo since files are in /var/www/
cd /var/www/portal-servicios
sudo npm run build
# Output: /var/www/portal-servicios/dist/
```

### Type Check
```bash
tsc -b
# TypeScript compiler in build mode
```

### Lint Code
```bash
npm run lint
# ESLint with React rules
```

### Preview Production Build
```bash
npm run preview
# Preview built files locally before deployment
```

## shadcn/ui Commands

### Add New Component
```bash
npx shadcn@latest add <component-name>
# Example: npx shadcn@latest add dialog
# Adds component to src/components/ui/
```

### List Available Components
```bash
npx shadcn@latest add
# Interactive component selector
```

## Deployment

After building:
1. Built files are written to `/var/www/portal-servicios/dist/`
2. Nginx automatically serves the updated files (no restart needed)
3. Hard refresh browser (`Ctrl+Shift+R`) if caching issues occur

## Nginx Management

### Test Configuration
```bash
sudo nginx -t
```

### Reload Configuration
```bash
sudo systemctl reload nginx
```

### View Error Logs
```bash
sudo tail -f /var/log/nginx/portal-servicios_error.log
```

### View Access Logs
```bash
sudo tail -f /var/log/nginx/portal-servicios_access.log
```

## Git Commands (if applicable)
```bash
# View status
git status

# Add all changes
git add .

# Commit changes
git commit -m "message"

# Push to remote
git push
```

## Troubleshooting

### Fix Permission Errors
```bash
sudo chown -R $USER:$USER /var/www/portal-servicios/node_modules
```

### Clear Build Cache
```bash
rm -rf dist/
sudo npm run build
```
