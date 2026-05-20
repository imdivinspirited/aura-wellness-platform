/**
 * Public read-only geo helpers (proxies external APIs; avoids browser CORS).
 * GET /api/v1/geo/countries
 * GET /api/v1/geo/states?country=...
 * GET /api/v1/geo/cities?country=...&state=...
 * GET /api/v1/geo/pincode/:pin — India Post style 6-digit pincode lookup
 */
import { Router } from 'express';

const router = Router();

const FETCH_TIMEOUT_MS = 20000;

async function fetchJson(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
}

router.get('/countries', async (_req, res) => {
  try {
    const { ok, json } = await fetchJson('https://restcountries.com/v3.1/all?fields=name,cca2');
    if (!ok || !Array.isArray(json)) {
      return res.status(502).json({ success: false, error: { message: 'Failed to load countries.' } });
    }
    const data = json
      .map((x) => ({ name: x?.name?.common || '', code: x?.cca2 || '' }))
      .filter((x) => x.name && x.code)
      .sort((a, b) => a.name.localeCompare(b.name, 'en'));
    return res.json({ success: true, data });
  } catch (e) {
    console.error('[geo/countries]', e);
    return res.status(502).json({ success: false, error: { message: 'Failed to load countries.' } });
  }
});

router.get('/states', async (req, res) => {
  const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';
  if (!country) {
    return res.status(400).json({ success: false, error: { message: 'Missing country.' } });
  }
  try {
    const url = `https://countriesnow.space/api/v0.1/countries/states/q?country=${encodeURIComponent(country)}`;
    const { ok, json } = await fetchJson(url);
    if (!ok || json?.error === true) {
      return res.status(502).json({ success: false, error: { message: 'Failed to load states.' } });
    }
    const raw = json?.data?.states;
    const names = Array.isArray(raw)
      ? raw.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
      : [];
    const data = [...new Set(names)].sort((a, b) => a.localeCompare(b, 'en'));
    return res.json({ success: true, data });
  } catch (e) {
    console.error('[geo/states]', e);
    return res.status(502).json({ success: false, error: { message: 'Failed to load states.' } });
  }
});

router.get('/cities', async (req, res) => {
  const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';
  const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';
  if (!country || !state) {
    return res.status(400).json({ success: false, error: { message: 'Missing country or state.' } });
  }
  try {
    const url = `https://countriesnow.space/api/v0.1/countries/state/cities/q?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`;
    const { ok, json } = await fetchJson(url);
    if (!ok || json?.error === true) {
      return res.status(502).json({ success: false, error: { message: 'Failed to load cities.' } });
    }
    const raw = json?.data;
    const list = Array.isArray(raw) ? raw : [];
    const data = [...new Set(list.map((x) => String(x).trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'en')
    );
    return res.json({ success: true, data });
  } catch (e) {
    console.error('[geo/cities]', e);
    return res.status(502).json({ success: false, error: { message: 'Failed to load cities.' } });
  }
});

/**
 * India 6-digit PIN: fills state, district (city), area line from India Post data.
 */
router.get('/pincode/:pin', async (req, res) => {
  const pin = String(req.params.pin || '').replace(/\D/g, '');
  if (pin.length !== 6) {
    return res.status(400).json({ success: false, error: { message: 'Enter a 6-digit Indian PIN code.' } });
  }
  try {
    const { ok, json } = await fetchJson(`https://api.postalpincode.in/pincode/${pin}`);
    if (!ok) {
      return res.status(502).json({ success: false, error: { message: 'PIN lookup failed.' } });
    }
    const arr = Array.isArray(json) ? json[0] : json;
    const status = arr?.Status;
    const offices = Array.isArray(arr?.PostOffice) ? arr.PostOffice : [];
    if (status !== 'Success' || offices.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'No address found for this PIN.' } });
    }
    const first = offices[0];
    const country = first.Country || 'India';
    const state = first.State || '';
    const district = first.District || '';
    const city = district;
    const addressLine = [first.Name, district, state, first.Pincode || pin].filter(Boolean).join(', ');
    const officesOut = offices.slice(0, 30).map((o) => ({
      name: o.Name || '',
      district: o.District || '',
      state: o.State || '',
      pincode: o.Pincode || pin,
    }));
    return res.json({
      success: true,
      data: {
        country,
        state,
        city,
        district,
        addressLine,
        pincode: first.Pincode || pin,
        offices: officesOut,
      },
    });
  } catch (e) {
    console.error('[geo/pincode]', e);
    return res.status(502).json({ success: false, error: { message: 'PIN lookup failed.' } });
  }
});

export default router;
