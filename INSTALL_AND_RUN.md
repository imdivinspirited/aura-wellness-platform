# Install Node.js and Run the Project

## Step 1: Install Node.js

**Node.js is NOT installed on your system.** You need to install it first.

### Quick Installation:

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Click "Download Node.js (LTS)" - this is the recommended version
   - The file will be something like: `node-v20.x.x-x64.msi`

2. **Install Node.js:**
   - Double-click the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - **IMPORTANT:** Make sure "Add to PATH" is checked (it should be by default)
   - Click "Install"
   - Wait for installation to complete

3. **Verify Installation:**
   - **Close ALL terminal/PowerShell windows** (important!)
   - Open a **NEW** PowerShell or Command Prompt window
   - Type:
     ```powershell
     node --version
     ```
   - You should see something like: `v20.x.x`
   - Type:
     ```powershell
     npm --version
     ```
   - You should see something like: `10.x.x`

## Step 2: Run the Project

Once Node.js is installed:

1. **Open a NEW PowerShell window** (important - new window to refresh PATH)

2. **Navigate to project:**
   ```powershell
   cd "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"
   ```

3. **Install dependencies (first time only):**
   ```powershell
   npm install
   ```
   This will take 2-5 minutes. Wait for it to complete.

4. **Start the development server:**
   ```powershell
   npm run dev
   ```

5. **Wait for the server to start:**
   You should see output like:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:8080/
   ➜  Network: use --host to expose
   ```

6. **Open your browser:**
   - The server will be running at: **http://localhost:8080**
   - Or click the link shown in the terminal
   - The page should load automatically

## Troubleshooting

### "npm is not recognized" after installing Node.js
- **Close ALL terminal windows**
- Open a **NEW** PowerShell/Command Prompt
- Try again
- If still not working, restart your computer

### Port 8080 already in use
- The server will automatically try the next port (8081, 8082, etc.)
- Check the terminal output for the actual URL
- Or change the port in `vite.config.ts`:
  ```typescript
  server: {
    port: 5173, // Change this number
  }
  ```

### Installation takes too long
- This is normal for the first `npm install`
- It's downloading all dependencies (can take 2-5 minutes)
- Make sure you have internet connection

### Still having issues?
1. Make sure Node.js is installed: `node --version`
2. Make sure npm is available: `npm --version`
3. Make sure you're in the correct directory
4. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

## Quick Reference

```powershell
# Check if Node.js is installed
node --version

# Check if npm is available
npm --version

# Navigate to project
cd "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"

# Install dependencies (first time)
npm install

# Start server
npm run dev

# Stop server
Press Ctrl+C in the terminal
```

## Expected Result

Once everything is working:
- Terminal shows: `VITE ready` with a localhost URL
- Browser opens to: `http://localhost:8080`
- You see the Aura Wellness Platform homepage
- No errors in browser console (F12)

---

**Next Steps:** After installing Node.js, follow Step 2 above to run the project.
