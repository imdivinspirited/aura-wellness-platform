# GitHub पर Project Upload करने की Guide

## ⚠️ Important Security Note
**कभी भी password directly git commands में use न करें!** 
GitHub अब passwords accept नहीं करता। आपको Personal Access Token use करना होगा।

## Step 1: Git Install करें

1. **Git Download करें:**
   - Go to: https://git-scm.com/download/win
   - Download करें और install करें
   - Installation के दौरान default options select करें

2. **Verify Installation:**
   - **NEW PowerShell window** खोलें
   - Type करें:
     ```powershell
     git --version
     ```
   - Version number दिखना चाहिए

## Step 2: GitHub Personal Access Token बनाएं

**Password use न करें!** Token बनाना होगा:

1. **GitHub पर जाएं:**
   - https://github.com/settings/tokens पर जाएं
   - Login करें (username: imdivinspirited)

2. **New Token बनाएं:**
   - "Generate new token" → "Generate new token (classic)" click करें
   - Note: "Aura Wellness Platform" लिखें
   - Expiration: 90 days (या जितना चाहें)
   - Scopes: ✅ **repo** (सभी repo permissions) check करें
   - "Generate token" click करें

3. **Token Copy करें:**
   - ⚠️ **IMPORTANT:** Token सिर्फ एक बार दिखेगा!
   - Token को copy करके safe place में save करें
   - Example: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 3: GitHub Repository बनाएं

1. **GitHub पर जाएं:**
   - https://github.com/new
   - Login करें

2. **New Repository बनाएं:**
   - Repository name: `aura-wellness-platform` (या जो चाहें)
   - Description: "Ultra-modern luxury wellness platform"
   - Public या Private select करें
   - ❌ **"Initialize with README" UNCHECK करें** (हमारे पास already code है)
   - "Create repository" click करें

## Step 4: Project को GitHub पर Push करें

**PowerShell में ये commands run करें:**

```powershell
# 1. Project folder में जाएं
cd "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"

# 2. Git initialize करें (अगर पहले से नहीं है)
git init

# 3. सभी files add करें
git add .

# 4. First commit करें
git commit -m "Initial commit: Ultra-modern luxury wellness platform with all fixes"

# 5. GitHub repository को remote के रूप में add करें
# REPLACE 'your-repo-name' अपने repository name से
git remote add origin https://github.com/imdivinspirited/your-repo-name.git

# 6. Main branch set करें
git branch -M main

# 7. Push करें (Token use करें)
# Username: imdivinspirited
# Password: आपका Personal Access Token (ghp_...)
git push -u origin main
```

## Step 5: Authentication

जब `git push` run करेंगे, तो prompt आएगा:

```
Username: imdivinspirited
Password: [यहाँ आपका Personal Access Token paste करें - ghp_...]
```

⚠️ **Password field में अपना GitHub password नहीं, बल्कि Personal Access Token paste करें!**

## Alternative: GitHub CLI Use करें (Easier)

अगर आप GitHub CLI install करें, तो easier होगा:

1. **GitHub CLI Install:**
   - https://cli.github.com/ से download करें

2. **Login करें:**
   ```powershell
   gh auth login
   ```
   - Browser में login करें
   - Token automatically setup हो जाएगा

3. **Repository create और push:**
   ```powershell
   cd "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"
   git init
   git add .
   git commit -m "Initial commit: Ultra-modern luxury wellness platform"
   gh repo create aura-wellness-platform --public --source=. --remote=origin --push
   ```

## Troubleshooting

### "git is not recognized"
- Git install करें: https://git-scm.com/download/win
- **NEW PowerShell window** खोलें

### "Authentication failed"
- Password नहीं, **Personal Access Token** use करें
- Token में `repo` scope होना चाहिए

### "Repository not found"
- Repository name check करें
- Username correct है या नहीं check करें

### "Remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/imdivinspirited/your-repo-name.git
```

## Quick Commands Summary

```powershell
# Navigate to project
cd "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"

# Initialize git (first time)
git init

# Add all files
git add .

# Commit
git commit -m "Your commit message"

# Add remote (replace repo-name)
git remote add origin https://github.com/imdivinspirited/repo-name.git

# Push
git push -u origin main
```

## Security Best Practices

✅ **DO:**
- Personal Access Token use करें
- Token को secure place में save करें
- Token को कभी code में commit न करें

❌ **DON'T:**
- Password directly use न करें
- Token को public में share न करें
- Token को code में hardcode न करें

---

**Next Steps:**
1. Git install करें
2. Personal Access Token बनाएं
3. GitHub repository बनाएं
4. Above commands run करें
