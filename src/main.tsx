import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Global error handler to prevent white screen on initialization crashes
window.addEventListener('error', (event) => {
  if (event.message?.includes('supabaseUrl is required') || event.message?.includes('supabaseKey is required')) {
    event.preventDefault();
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui;padding:2rem;">
          <div style="max-width:400px;text-align:center;">
            <h1 style="font-size:1.5rem;margin-bottom:1rem;">Configuration Error</h1>
            <p style="color:#666;margin-bottom:1rem;">The app is missing required environment variables. Please reload or contact support.</p>
            <button onclick="window.location.reload()" style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #ccc;cursor:pointer;">Reload</button>
          </div>
        </div>
      `;
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
