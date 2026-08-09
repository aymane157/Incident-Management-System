import { getStoredAuthToken } from './session';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getStoredAuthToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const target = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  return globalThis["fetch"](target, {
    ...init,
    headers,
  });
}

export type ApplicationOption = {
  id: number;
  name: string;
  description?: string | null;
  clientUser?: UserDto | null;
  appTeam?: TeamDto | null;
  systemTeam?: TeamDto | null;
  databaseTeam?: TeamDto | null;
  networkTeam?: TeamDto | null;
};

export type IncidentStatus = 'NEW' | 'REJETE' | 'VALIDATED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type IncidentLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type UserDto = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  password?: string | null;
  role?: string | null;
  teamId?: number | null;
  teamName?: string | null;
  teamFunctionRole?: string | null;
};

export type TeamDto = {
  id: number;
  name?: string | null;
  members?: UserDto[] | null;
  functionRole?: string | null;
  description?: string | null;
};

export type AttachmentDto = {
  id: number;
  fileName?: string | null;
  filePath?: string | null;
  contentType?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
};

export type RcaReportDto = {
  id: number;
  incident?: IncidentDto | null;
  author?: UserDto | null;
  rootCause?: string | null;
  solution?: string | null;
  preventiveMeasures?: string | null;
  validatedByManager?: boolean;
  validatedBy?: UserDto | null;
  createdAt?: string | null;
  validatedAt?: string | null;
  sentToClient?: boolean;
  sentToClientAt?: string | null;
  rejectedByClient?: boolean;
  clientRejectionReason?: string | null;
  clientRejectedAt?: string | null;
};

export type NotificationDto = {
  id: number;
  recipient?: UserDto | null;
  incident?: IncidentDto | null;
  type?: string | null;
  message?: string | null;
  createdAt?: string | null;
};

export type RejectIncidentRequest = {
  reason: string;
  teamMemberId: number;
};

export type RejectIncidentByManagerRequest = {
  reason: string;
  managerId: number;
};

export type ManagerIncidentRejectionReviewRequest = {
  managerId: number;
  validated: boolean;
};

export type CreateRcaReportRequest = {
  incidentId: number;
  authorId: number;
  rootCause: string;
  solution: string;
  preventiveMeasures: string;
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

export async function fetchApplications(_clientUserId?: number): Promise<ApplicationOption[]> {
  const url =  `${API_BASE_URL}/applications`;
  const response = await apiFetch(url);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchTeams(): Promise<TeamDto[]> {
  const response = await apiFetch(`${API_BASE_URL}/teams`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchIncidents(): Promise<IncidentDto[]> {
  const response = await apiFetch(`${API_BASE_URL}/incidents`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchManagerIncidents(managerId: number): Promise<IncidentDto[]> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/manager/${managerId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchUsers(): Promise<UserDto[]> {
  const response = await apiFetch(`${API_BASE_URL}/users`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateUser(userId: number, user: UserDto): Promise<UserDto> {
  const response = await apiFetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchUserById(userId: number): Promise<UserDto> {
  const response = await apiFetch(`${API_BASE_URL}/users/${userId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchTeamById(teamId: number): Promise<TeamDto> {
  const response = await apiFetch(`${API_BASE_URL}/teams/${teamId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchTeamIncidents(teamId: number): Promise<IncidentDto[]> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/team/${teamId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchNewIncident(referenceId: string): Promise<IncidentDto> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/FindNewIncident/${encodeURIComponent(referenceId)}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateIncident(id: number, incident: IncidentDto): Promise<IncidentDto> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/${id}`, {
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

export async function claimIncident(incidentId: number, userId: number): Promise<IncidentDto> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/${incidentId}/claim/${userId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function rejectIncidentWithReason(
  reference: string,
  request: RejectIncidentRequest,
): Promise<IncidentDto> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/${encodeURIComponent(reference)}/rejectIncidentWithReason`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function rejectIncidentByManager(
  reference: string,
  request: RejectIncidentByManagerRequest,
): Promise<IncidentDto> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/${encodeURIComponent(reference)}/rejectIncidentByManager`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function reviewIncidentRejection(
  reference: string,
  request: ManagerIncidentRejectionReviewRequest,
): Promise<IncidentDto> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/${encodeURIComponent(reference)}/reviewIncidentRejection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
export async function reopenRejectedIncident(reference: string, managerId: number): Promise<IncidentDto> {
  const response = await apiFetch(`${API_BASE_URL}/incidents/${encodeURIComponent(reference)}/reopenRejectedIncident/${managerId}`, {
    method: 'POST',
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
  const response = await apiFetch(`${API_BASE_URL}/incidents/client`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchRcaReportByIncident(incidentId: number): Promise<RcaReportDto | null> {
  const response = await apiFetch(`${API_BASE_URL}/rca-reports/incident/${incidentId}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchRcaReports(): Promise<RcaReportDto[]> {
  const response = await apiFetch(`${API_BASE_URL}/rca-reports`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function createRcaReport(report: CreateRcaReportRequest): Promise<RcaReportDto> {
  const response = await apiFetch(`${API_BASE_URL}/rca-reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateRcaReport(id: number, report: Record<string, unknown>): Promise<RcaReportDto> {
  const response = await apiFetch(`${API_BASE_URL}/rca-reports/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateRcaReportStatus(
  id: number,
  incidentManagerId: number,
  validation: boolean,
): Promise<RcaReportDto> {
  const response = await apiFetch(`${API_BASE_URL}/rca-reports/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      incidentManagerId,
      validation,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}


export async function sendRcaToClient(id: number, managerId: number): Promise<RcaReportDto> {
  const response = await apiFetch(`${API_BASE_URL}/rca-reports/${id}/send-to-client/${managerId}`, { method: 'POST' });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchClientRcaReports(clientId: number): Promise<RcaReportDto[]> {
  const response = await apiFetch(`${API_BASE_URL}/rca-reports/client/${clientId}`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function rejectRcaByClient(id: number, clientId: number, reason: string): Promise<RcaReportDto> {
  const response = await apiFetch(`${API_BASE_URL}/rca-reports/${id}/client-rejection`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, reason }) });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
export async function fetchNotificationsByRecipient(userId: number): Promise<NotificationDto[]> {
  const response = await apiFetch(`${API_BASE_URL}/notifications/recipient/${userId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}










