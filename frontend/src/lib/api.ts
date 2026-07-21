export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export type ApplicationOption = {
  id: number;
  name: string;
  description?: string | null;
};

export type IncidentStatus = 'NEW' | 'REJETE' | 'VALIDATED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type IncidentLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type UserDto = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

export type TeamDto = {
  id: number;
  name?: string | null;
};

export type AttachmentDto = {
  id: number;
  fileName?: string | null;
  filePath?: string | null;
  contentType?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
};

export type IncidentDto = {
  id: number;
  reference: string;
  name?: string | null;
  description?: string | null;
  status: IncidentStatus;
  incidentLevel: IncidentLevel | null;
  application?: ApplicationOption | null;
  createdBy?: UserDto | null;
  incidentManager?: UserDto | null;
  assignedTeam?: TeamDto | null;
  handledBy?: UserDto | null;
  rejectionReason?: string | null;
  attachments: AttachmentDto[];
  createdAt?: string | null;
  validatedAt?: string | null;
  assignedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  slaDeadline?: string | null;
};

export const STATIC_INCIDENT_MANAGER_ID = 3;

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

export async function fetchTeams(): Promise<TeamDto[]> {
  const response = await fetch(`${API_BASE_URL}/teams`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchIncidents(): Promise<IncidentDto[]> {
  const response = await fetch(`${API_BASE_URL}/incidents`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchManagerIncidents(managerId: number = STATIC_INCIDENT_MANAGER_ID): Promise<IncidentDto[]> {
  const response = await fetch(`${API_BASE_URL}/incidents/manager/${managerId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateIncident(id: number, incident: IncidentDto): Promise<IncidentDto> {
  const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incident),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export function getAttachmentUrl(attachmentId: number): string {
  return `${API_BASE_URL}/attachments/${attachmentId}/file`;
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
