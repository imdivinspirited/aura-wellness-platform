# GitHub पर Push करने का Script
# ⚠️ Personal Access Token की जरूरत होगी, password नहीं!

Write-Host "=== Aura Wellness Platform - GitHub Push Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
$projectPath = "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"
Set-Location $projectPath
Write-Host "📁 Project directory: $projectPath" -ForegroundColor Cyan

# Check if .git exists
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Check current status
Write-Host ""
Write-Host "📊 Current git status:" -ForegroundColor Cyan
git status --short

# Add all files
Write-Host ""
Write-Host "➕ Adding all files..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files added" -ForegroundColor Green

# Commit
Write-Host ""
$commitMessage = "Initial commit: Ultra-modern luxury wellness platform with all fixes and improvements"
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
Write-Host "   Message: $commitMessage" -ForegroundColor Gray
git commit -m $commitMessage
Write-Host "✅ Changes committed" -ForegroundColor Green

# Check if remote exists
Write-Host ""
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "✅ Remote 'origin' already exists: $remoteExists" -ForegroundColor Green
    Write-Host ""
    Write-Host "Do you want to update the remote URL? (y/n)" -ForegroundColor Yellow
    $updateRemote = Read-Host
    if ($updateRemote -eq "y" -or $updateRemote -eq "Y") {
        Write-Host "Enter your GitHub repository URL:" -ForegroundColor Yellow
        Write-Host "Example: https://github.com/imdivinspirited/aura-wellness-platform.git" -ForegroundColor Gray
        $repoUrl = Read-Host
        git remote set-url origin $repoUrl
        Write-Host "✅ Remote URL updated" -ForegroundColor Green
    }
} else {
    Write-Host "📡 Setting up remote repository..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Enter your GitHub repository URL:" -ForegroundColor Yellow
    Write-Host "Example: https://github.com/imdivinspirited/aura-wellness-platform.git" -ForegroundColor Gray
    $repoUrl = Read-Host
    git remote add origin $repoUrl
    Write-Host "✅ Remote added" -ForegroundColor Green
}

# Set main branch
Write-Host ""
Write-Host "🌿 Setting main branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch set to 'main'" -ForegroundColor Green

# Push to GitHub
Write-Host ""
Write-Host "🚀 Ready to push to GitHub!" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: When prompted for password, use your Personal Access Token!" -ForegroundColor Yellow
Write-Host "   NOT your GitHub password!" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Username: imdivinspirited" -ForegroundColor Gray
Write-Host "   Password: [Your Personal Access Token - ghp_...]" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter to continue with push, or Ctrl+C to cancel..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository is now available at:" -ForegroundColor Cyan
    $repoUrl = git remote get-url origin
    $repoUrl = $repoUrl -replace '\.git$', ''
    Write-Host "   $repoUrl" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check:" -ForegroundColor Red
    Write-Host "   1. Personal Access Token is correct" -ForegroundColor Yellow
    Write-Host "   2. Repository URL is correct" -ForegroundColor Yellow
    Write-Host "   3. You have write access to the repository" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For help, see GITHUB_SETUP.md" -ForegroundColor Cyan
}
