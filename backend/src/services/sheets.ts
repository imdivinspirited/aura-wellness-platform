import crypto from 'crypto';

type SheetsConfig = {
  spreadsheetId: string;
  worksheetName: string;
  serviceAccountJson: string;
};

function base64Url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getSheetsConfig(): SheetsConfig | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const worksheetName = process.env.GOOGLE_SHEETS_WORKSHEET || 'Sheet1';
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!spreadsheetId || !serviceAccountJson) return null;
  return { spreadsheetId, worksheetName, serviceAccountJson };
}

async function getAccessToken(): Promise<string> {
  const cfg = getSheetsConfig();
  if (!cfg) throw new Error('Google Sheets not configured');

  const creds = JSON.parse(cfg.serviceAccountJson) as {
    client_email: string;
    private_key: string;
  };

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 60 * 30,
  };

  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const key = crypto.createPrivateKey(creds.private_key);
  const sig = crypto.sign('RSA-SHA256', Buffer.from(signingInput), key);
  const jwt = `${signingInput}.${base64Url(sig)}`;

  const form = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`Google token error: ${txt}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Google token missing access_token');
  return json.access_token;
}

export async function appendToSheets(row: Record<string, unknown>): Promise<{ rowIndex?: number }> {
  const cfg = getSheetsConfig();
  if (!cfg) throw new Error('Google Sheets not configured');

  const token = await getAccessToken();

  const values = [[
    row['serialNumber'] ?? '',
    row['heading'] ?? '',
    row['formType'] ?? '',
    row['fullName'] ?? '',
    row['email'] ?? '',
    row['phone'] ?? '',
    row['whatsapp'] ?? '',
    row['type'] ?? '',
    row['position'] ?? '',
    row['age'] ?? '',
    row['gender'] ?? '',
    row['city'] ?? '',
    row['state'] ?? '',
    row['country'] ?? '',
    row['education'] ?? '',
    row['skills'] ?? '',
    row['availableFrom'] ?? '',
    row['duration'] ?? '',
    row['whyJoin'] ?? '',
    row['resumeUrl'] ?? '',
    row['photoUrl'] ?? '',
    row['createdAt'] ?? '',
  ]];

  const range = `${cfg.worksheetName}!A1`;
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(cfg.spreadsheetId)}/values/${encodeURIComponent(range)}:append`
  );
  url.searchParams.set('valueInputOption', 'USER_ENTERED');

  const resp = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => resp.statusText);
    throw new Error(`Sheets append error: ${txt}`);
  }

  const json = (await resp.json()) as { updates?: { updatedRange?: string } };
  const updatedRange = json.updates?.updatedRange;
  const match = updatedRange?.match(/!A(\d+):/);
  const rowIndex = match ? Number(match[1]) : undefined;
  return { rowIndex };
}

