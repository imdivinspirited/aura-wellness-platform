/**
 * Build-time marketing / analytics / GBP — set in root `.env` (VITE_*).
 */

function trim(v: string | undefined): string {
  return (v ?? '').trim();
}

/** Google Analytics 4 Measurement ID (G-XXXXXXXXXX) */
export function getGa4MeasurementId(): string | undefined {
  const id = trim(import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined);
  return id || undefined;
}

/** Google Search Console HTML tag verification content value */
export function getGoogleSiteVerification(): string | undefined {
  const v = trim(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined);
  return v || undefined;
}

/** Enable LocalBusiness + GBP-oriented JSON-LD */
export function isGbpJsonLdEnabled(): boolean {
  const v = trim(import.meta.env.VITE_GBP_JSONLD_ENABLED as string | undefined).toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export function getGbpLocalBusiness(): {
  name: string;
  streetAddress?: string;
  addressLocality: string;
  addressRegion: string;
  postalCode?: string;
  addressCountry: string;
  telephone?: string;
  url?: string;
  geo?: { lat: number; lng: number };
} | null {
  if (!isGbpJsonLdEnabled()) return null;
  const name = trim(import.meta.env.VITE_GBP_NAME as string | undefined) || 'The Art of Living International Center, Bangalore';
  const locality = trim(import.meta.env.VITE_GBP_ADDRESS_LOCALITY as string | undefined) || 'Bengaluru';
  const region = trim(import.meta.env.VITE_GBP_ADDRESS_REGION as string | undefined) || 'KA';
  const country = trim(import.meta.env.VITE_GBP_ADDRESS_COUNTRY as string | undefined) || 'IN';
  const lat = Number(import.meta.env.VITE_GBP_GEO_LAT);
  const lng = Number(import.meta.env.VITE_GBP_GEO_LNG);
  const geo =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
  return {
    name,
    streetAddress: trim(import.meta.env.VITE_GBP_STREET_ADDRESS as string | undefined) || undefined,
    addressLocality: locality,
    addressRegion: region,
    postalCode: trim(import.meta.env.VITE_GBP_POSTAL_CODE as string | undefined) || undefined,
    addressCountry: country,
    telephone: trim(import.meta.env.VITE_GBP_TELEPHONE as string | undefined) || undefined,
    url: trim(import.meta.env.VITE_GBP_SAME_AS_URL as string | undefined) || undefined,
    geo,
  };
}
