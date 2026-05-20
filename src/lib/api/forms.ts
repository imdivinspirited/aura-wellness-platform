import { apiClient } from './client';

export type FormType = 'seva' | 'career';

export type UploadKind = 'resume' | 'photo';

export async function presignFormUpload(input: {
  kind: UploadKind;
  contentType: string;
  fileName: string;
  sizeBytes: number;
}) {
  return apiClient.post<{ success: boolean; data: { uploadUrl: string; url: string; key: string } }>(
    '/forms/presign',
    input,
    { requireAuth: true }
  );
}

export async function submitForm(input: {
  formType: FormType;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  type?: string;
  position?: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  education?: string;
  skills?: string;
  availableFrom?: string;
  duration?: string;
  whyJoin?: string;
  files?: Array<{ kind: UploadKind; url: string; originalName?: string; contentType?: string; sizeBytes?: number }>;
}) {
  return apiClient.post('/forms/submit', input, { requireAuth: true });
}

