export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export type ApplicationOption = {
  id: number;
  name: string;
  description?: string | null;
};

async function parseError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload === 'object') {
      if (typeof payload.message === 'string') return payload.message;
      if (typeof payload.error === 'string') return payload.error;
      if (typeof payload.detail === 'string') return payload.detail;
    }
  }

  const text = await response.text().catch(() => '');
  return text.trim() || `Request failed with status ${response.status}`;
}

export async function fetchApplications(): Promise<ApplicationOption[]> {
  const response = await fetch(`${API_BASE_URL}/applications`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function createClientIncident(formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/incidents/client`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
