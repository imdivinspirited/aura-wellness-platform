import { getApiBaseUrl } from './client';

export type CountryOption = { name: string; code: string };

export type PincodeLookupData = {
  country: string;
  state: string;
  city: string;
  district: string;
  addressLine: string;
  pincode: string;
  offices: { name: string; district: string; state: string; pincode: string }[];
};

async function parse<T>(res: Response): Promise<T> {
  const json = (await res.json()) as { success?: boolean; data?: T; error?: { message?: string } };
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message || 'Request failed');
  }
  return json.data as T;
}

export async function listCountries(): Promise<CountryOption[]> {
  const res = await fetch(`${getApiBaseUrl()}/geo/countries`);
  return parse(res);
}

export async function listStates(countryName: string): Promise<string[]> {
  const q = new URLSearchParams({ country: countryName });
  const res = await fetch(`${getApiBaseUrl()}/geo/states?${q}`);
  return parse(res);
}

export async function listCities(countryName: string, stateName: string): Promise<string[]> {
  const q = new URLSearchParams({ country: countryName, state: stateName });
  const res = await fetch(`${getApiBaseUrl()}/geo/cities?${q}`);
  return parse(res);
}

export async function lookupIndiaPincode(pinDigits: string): Promise<PincodeLookupData> {
  const pin = pinDigits.replace(/\D/g, '');
  const res = await fetch(`${getApiBaseUrl()}/geo/pincode/${encodeURIComponent(pin)}`);
  return parse(res);
}
