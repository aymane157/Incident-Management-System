export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

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
  role?: string | null;
  teamId?: number | null;
  teamName?: string | null;
  teamFunctionRole?: string | null;
};

export type UserRequest = {
  id?: number | null;
  firstName: string;
  lastName: string;
  email: string;
  password?: string | null;
  role: string;
  teamId?: number | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  username: string;
  token: string;
  expiresInMs: number;
  role: string;
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

let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export function clearAuthToken() {
  setAuthToken(null);
}

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

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response;
}

export async function login(requestBody: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchApplications(_clientUserId?: number): Promise<ApplicationOption[]> {
  return (await request('/applications')).json();
}

export async function fetchTeams(): Promise<TeamDto[]> {
  return (await request('/teams')).json();
}

export async function fetchIncidents(): Promise<IncidentDto[]> {
  return (await request('/incidents')).json();
}

export async function fetchManagerIncidents(managerId: number): Promise<IncidentDto[]> {
  return (await request(`/incidents/manager/${managerId}`)).json();
}

export async function fetchUsers(): Promise<UserDto[]> {
  return (await request('/users')).json();
}

export async function updateUser(userId: number, user: UserRequest): Promise<UserDto> {
  return (await request(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  })).json();
}

export async function fetchUserById(userId: number): Promise<UserDto> {
  return (await request(`/users/${userId}`)).json();
}

export async function fetchTeamById(teamId: number): Promise<TeamDto> {
  return (await request(`/teams/${teamId}`)).json();
}

export async function fetchTeamIncidents(teamId: number): Promise<IncidentDto[]> {
  return (await request(`/incidents/team/${teamId}`)).json();
}

export async function fetchNewIncident(referenceId: string): Promise<IncidentDto> {
  return (await request(`/incidents/FindNewIncident/${encodeURIComponent(referenceId)}`)).json();
}

export async function updateIncident(id: number, incident: IncidentDto): Promise<IncidentDto> {
  return (await request(`/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(incident),
  })).json();
}

export async function claimIncident(incidentId: number, userId: number): Promise<IncidentDto> {
  return (await request(`/incidents/${incidentId}/claim/${userId}`, { method: 'POST' })).json();
}

export async function rejectIncidentWithReason(reference: string, requestBody: RejectIncidentRequest): Promise<IncidentDto> {
  return (await request(`/incidents/${encodeURIComponent(reference)}/rejectIncidentWithReason`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })).json();
}

export async function rejectIncidentByManager(reference: string, requestBody: RejectIncidentByManagerRequest): Promise<IncidentDto> {
  return (await request(`/incidents/${encodeURIComponent(reference)}/rejectIncidentByManager`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })).json();
}

export async function reviewIncidentRejection(reference: string, requestBody: ManagerIncidentRejectionReviewRequest): Promise<IncidentDto> {
  return (await request(`/incidents/${encodeURIComponent(reference)}/reviewIncidentRejection`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })).json();
}

export async function reopenRejectedIncident(reference: string, managerId: number): Promise<IncidentDto> {
  return (await request(`/incidents/${encodeURIComponent(reference)}/reopenRejectedIncident/${managerId}`, {
    method: 'POST',
  })).json();
}

export function getAttachmentUrl(attachmentId: number): string {
  return authToken
    ? `${API_BASE_URL}/attachments/${attachmentId}/file?token=${encodeURIComponent(authToken)}`
    : `${API_BASE_URL}/attachments/${attachmentId}/file`;
}

export async function createClientIncident(formData: FormData) {
  return (await request('/incidents/client', {
    method: 'POST',
    body: formData,
  })).json();
}

export async function fetchRcaReportByIncident(incidentId: number): Promise<RcaReportDto | null> {
  const response = await fetch(`${API_BASE_URL}/rca-reports/incident/${incidentId}`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchRcaReports(): Promise<RcaReportDto[]> {
  return (await request('/rca-reports')).json();
}

export async function createRcaReport(report: CreateRcaReportRequest): Promise<RcaReportDto> {
  return (await request('/rca-reports', {
    method: 'POST',
    body: JSON.stringify(report),
  })).json();
}

export async function updateRcaReport(id: number, report: Record<string, unknown>): Promise<RcaReportDto> {
  return (await request(`/rca-reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(report),
  })).json();
}

export async function updateRcaReportStatus(id: number, incidentManagerId: number, validation: boolean): Promise<RcaReportDto> {
  return (await request(`/rca-reports/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ incidentManagerId, validation }),
  })).json();
}

export async function sendRcaToClient(id: number, managerId: number): Promise<RcaReportDto> {
  return (await request(`/rca-reports/${id}/send-to-client/${managerId}`, { method: 'POST' })).json();
}

export async function fetchClientRcaReports(clientId: number): Promise<RcaReportDto[]> {
  return (await request(`/rca-reports/client/${clientId}`)).json();
}

export async function rejectRcaByClient(id: number, clientId: number, reason: string): Promise<RcaReportDto> {
  return (await request(`/rca-reports/${id}/client-rejection`, {
    method: 'POST',
    body: JSON.stringify({ clientId, reason }),
  })).json();
}

export async function fetchNotificationsByRecipient(userId: number): Promise<NotificationDto[]> {
  return (await request(`/notifications/recipient/${userId}`)).json();
}
