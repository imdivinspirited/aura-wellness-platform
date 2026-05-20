import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

window.addEventListener("error", (event) => {
  console.error("[Global Error]", event.message, event.error);
  const msg = event.message || "";
  if (
    msg.includes("supabaseUrl is required") ||
    msg.includes("supabaseKey is required")
  ) {
    event.preventDefault();
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui;padding:2rem;">
          <div style="max-width:400px;text-align:center;">
            <h1 style="font-size:1.5rem;margin-bottom:1rem;">Configuration Error</h1>
            <p style="color:#666;margin-bottom:1rem;">The app is missing required Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then reload.</p>
            <button onclick="window.location.reload()" style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #ccc;cursor:pointer;">Reload</button>
          </div>
        </div>`;
    }
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[Unhandled Rejection]", event.reason);
});

try {
  const rootEl = document.getElementById("root");
  if (rootEl) {
    createRoot(rootEl).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } else {
    console.error("[Main] Root element not found");
  }
} catch (error) {
  console.error("[Main] Failed to render app:", error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui;padding:2rem;">
        <div style="max-width:400px;text-align:center;">
          <h1 style="font-size:1.5rem;margin-bottom:1rem;">Failed to Load</h1>
          <p style="color:#666;margin-bottom:1rem;">The application failed to initialize. Please reload.</p>
          <button onclick="window.location.reload()" style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #ccc;cursor:pointer;">Reload</button>
        </div>
      </div>`;
  }
}
