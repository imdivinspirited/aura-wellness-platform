/**
 * GA4 (gtag.js) + Core Web Vitals → GA4 when VITE_GA4_MEASUREMENT_ID is set.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { getGa4MeasurementId } from '@/config/marketingEnv';
import { useUserStore } from '@/stores/userStore';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function sendWebVitalToGa(metric: Metric) {
  const id = getGa4MeasurementId();
  if (!id || typeof window.gtag !== 'function') return;
  if (useUserStore.getState().privacy.analyticsConsent === false) return;
  window.gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    non_interaction: true,
    send_to: id,
  });
}

export function Ga4AndWebVitals() {
  const { pathname } = useLocation();
  const gaInit = useRef(false);
  const analyticsConsent = useUserStore((s) => s.privacy.analyticsConsent);
  const allowAnalytics = analyticsConsent !== false;

  useEffect(() => {
    const id = getGa4MeasurementId();
    if (!id || !allowAnalytics) return;

    const applyPage = () => {
      window.gtag?.('config', id, { page_path: pathname, anonymize_ip: true });
    };

    if (!gaInit.current) {
      gaInit.current = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer!.push(args);
      };
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      s.onload = () => {
        window.gtag?.('js', new Date());
        applyPage();
      };
      document.head.appendChild(s);
    } else {
      applyPage();
    }
  }, [pathname, allowAnalytics]);

  useEffect(() => {
    if (!getGa4MeasurementId() || !allowAnalytics) return;
    onCLS(sendWebVitalToGa);
    onINP(sendWebVitalToGa);
    onLCP(sendWebVitalToGa);
    onFCP(sendWebVitalToGa);
    onTTFB(sendWebVitalToGa);
  }, [allowAnalytics]);

  return null;
}
