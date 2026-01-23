# Setup and Run Guide - Aura Wellness Platform

## Prerequisites

1. **Install Node.js** (v18 or higher recommended)
   - Download from: https://nodejs.org/
   - Or use nvm: https://github.com/nvm-sh/nvm#installing-and-updating
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

## Quick Start

### Option 1: Frontend Only (Recommended for Development)

1. **Install dependencies:**
   ```bash
   cd "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - The app will be available at `http://localhost:5173` (or the port shown in terminal)

### Option 2: Full Stack (Frontend + Backend)

#### Step 1: Install Frontend Dependencies
```bash
cd "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"
npm install
```

#### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 3: Setup Backend Environment
Create a `.env` file in the `backend` folder:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/aura-wellness
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

#### Step 4: Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3001`

#### Step 5: Start Frontend Server (in a new terminal)
```bash
cd "C:\Users\PRIYANKA\Downloads\aura-wellness-platform-main\aura-wellness-platform-main"
npm run dev
```
Frontend will run on `http://localhost:5173`

## Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run type-check` - Check TypeScript types

## Troubleshooting

### Port Already in Use
If port 5173 (frontend) or 3001 (backend) is already in use:
- Change the port in `vite.config.ts` (frontend)
- Change PORT in `.env` file (backend)

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Issues
- Make sure MongoDB is running locally
- Or update `MONGODB_URI` in backend `.env` to your MongoDB connection string

## Project Structure

```
aura-wellness-platform-main/
├── src/                 # Frontend React code
├── public/              # Static assets
├── backend/             # Backend Express API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── models/      # Database models
│   │   └── server.ts    # Server entry point
│   └── package.json
└── package.json         # Frontend package.json
```

## Development Notes

- Frontend uses Vite for fast HMR (Hot Module Replacement)
- Backend uses tsx for TypeScript execution in development
- All images should be in `public/images/` folder
- Root user system is configured for content editing
- Session persistence is enabled (localStorage for root, backend for users)
