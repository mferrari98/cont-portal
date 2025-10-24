# Task Completion Checklist

When completing a coding task in this project, follow these steps:

## 1. Type Check
```bash
tsc -b
```
- Ensure no TypeScript errors
- Fix any type mismatches or missing types
- Verify all imports resolve correctly

## 2. Lint Code
```bash
npm run lint
```
- Fix ESLint warnings and errors
- Follow React hooks rules
- Ensure consistent code style

## 3. Test Locally
```bash
npm run dev
```
- Start development server
- Test in browser at http://localhost:5173
- Verify functionality works as expected
- Test both light and dark themes
- Test as admin and guest user roles

## 4. Build for Production
```bash
sudo npm run build
```
- IMPORTANT: Run with sudo (files in /var/www/)
- Verify build completes without errors
- Check output in `/var/www/portal-servicios/dist/`

## 5. Verify Deployment
- Files automatically served by Nginx from `dist/`
- Open https://10.10.9.252/ in browser
- Hard refresh: `Ctrl+Shift+R` to bypass cache
- Test all service links work correctly

## 6. Check Nginx (if service URLs changed)
```bash
sudo nginx -t
sudo systemctl reload nginx
```
- Only needed if modifying service URLs
- Verify configuration is valid
- Reload to apply changes

## 7. Browser Testing

### Functionality Checklist
- [ ] Login with admin credentials works
- [ ] Login with wrong credentials shows error
- [ ] Guest mode works
- [ ] Theme toggle works (dark/light)
- [ ] All service cards display correctly
- [ ] Service links navigate to correct URLs
- [ ] Logout button works
- [ ] Session persists on refresh
- [ ] Responsive layout works (mobile/desktop)

### Role-Based Access
- [ ] Admin sees all 6 services
- [ ] Guest sees only first 3 services

### Theme Testing
- [ ] Dark mode displays correctly
- [ ] Light mode displays correctly
- [ ] Theme preference persists on refresh
- [ ] All text is readable in both themes

## 8. Documentation (if needed)
- Update CLAUDE.md if architecture changed
- Update README.md if user-facing features changed
- Document any new environment variables
- Update component documentation if API changed

## Common Issues

### Build Fails with Permission Errors
```bash
sudo chown -R $USER:$USER /var/www/portal-servicios/node_modules
```

### Changes Not Appearing
- Hard refresh browser: `Ctrl+Shift+R`
- Clear browser cache
- Verify `dist/` files updated (check timestamps)

### Service URLs Not Working
- Check trailing slashes in URLs
- Verify Nginx configuration matches
- Check Nginx error logs:
  ```bash
  sudo tail -f /var/log/nginx/portal-servicios_error.log
  ```

### Type Errors
- Run `npm install` to ensure types are installed
- Check `tsconfig.json` configuration
- Verify import paths use `@/` alias correctly

## Git Workflow (if applicable)
1. Check status: `git status`
2. Review changes: `git diff`
3. Stage changes: `git add .`
4. Commit: `git commit -m "descriptive message"`
5. Push: `git push`

## Performance Checks
- Build size should be reasonable (< 1MB for main bundle)
- No console errors or warnings
- Fast initial load time
- Smooth theme transitions
