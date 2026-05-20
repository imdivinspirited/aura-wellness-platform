import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSeoPageMeta } from "@/components/seo/SeoOverrideContext";

const NotFound = () => {
  const location = useLocation();

  useSeoPageMeta({
    title: "Page not found (404) | The AOLIC Bangalore",
    description: "The page you requested does not exist or has moved.",
  });

  useEffect(() => {
    // Log 404 errors for analytics (in production, send to analytics service)
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
