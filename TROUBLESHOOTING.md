# Troubleshooting Guide

## Common Errors and Solutions

### 1. "npm is not recognized"
**Error:** `npm : The term 'npm' is not recognized`

**Solution:**
- Install Node.js from https://nodejs.org/
- Restart your terminal/PowerShell after installation
- Verify with: `node --version` and `npm --version`

### 2. "Cannot find module" or Import Errors
**Error:** `Cannot find module '@/components/...'` or similar

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 3. Port Already in Use
**Error:** `Port 8080 is already in use`

**Solution:**
- Change port in `vite.config.ts`:
  ```typescript
  server: {
    port: 5173, // or any other available port
  }
  ```
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F
  ```

### 4. TypeScript Errors
**Error:** Type errors during build

**Solution:**
```bash
# Check TypeScript configuration
npm run type-check

# If errors persist, check tsconfig.json settings
```

### 5. Missing Dependencies
**Error:** Module not found errors

**Solution:**
```bash
# Install all dependencies
npm install

# If specific package is missing
npm install <package-name>
```

### 6. Build Errors
**Error:** Build fails with various errors

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules .vite dist
npm install
npm run build
```

### 7. Image Loading Issues
**Error:** Images not loading from public folder

**Solution:**
- Ensure images are in `public/images/` folder
- Use paths starting with `/images/` (not `/src/assets/`)
- Check browser console for 404 errors

### 8. Root User Logout on Refresh
**Error:** Root user gets logged out on page refresh

**Solution:**
- ✅ Already fixed! Root auth now uses localStorage instead of sessionStorage
- Session persists for 24 hours

### 9. Video Embed Errors
**Error:** "An error occurred. Please try again later."

**Solution:**
- ✅ Already fixed! VideoPlayer now has proper error handling
- Check YouTube URL format
- Ensure internet connection

### 10. Module Resolution Errors
**Error:** `Failed to resolve import`

**Solution:**
- Check `vite.config.ts` alias configuration
- Verify `tsconfig.json` paths
- Restart dev server after config changes

## Quick Fix Commands

```bash
# Full reset (nuclear option)
rm -rf node_modules package-lock.json
npm install
npm run dev

# Check for outdated packages
npm outdated

# Update all packages (careful!)
npm update

# Clear npm cache
npm cache clean --force
```

## Getting Help

If you encounter an error:

1. **Check the error message** - Copy the full error text
2. **Check browser console** - Open DevTools (F12) and check Console tab
3. **Check terminal output** - Look for red error messages
4. **Check this guide** - See if your error is listed above

## Common Error Patterns

### Import Path Issues
- ✅ Use `@/` prefix for src imports
- ✅ Use `/images/` for public folder images
- ❌ Don't use `../` for deep imports, use `@/` instead

### Type Errors
- Check if TypeScript strict mode is causing issues
- Verify all imports have proper types
- Check `tsconfig.json` settings

### Runtime Errors
- Check browser console for JavaScript errors
- Verify all components are properly exported
- Check for missing props or undefined values

## Still Having Issues?

1. Share the **exact error message** from terminal or browser console
2. Share **what you were doing** when the error occurred
3. Share your **Node.js version** (`node --version`)
4. Share your **npm version** (`npm --version`)
