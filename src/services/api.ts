import {
  Staff,
  Department,
  Unit,
  User,
  PublicVerificationResult,
  VerificationLog,
  AuditLog,
  StaffDocument,
  SystemSettings,
  Role,
} from '../types/index.js';

const TOKEN_KEY = 'gue_auth_token';
const USER_KEY = 'gue_auth_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error(err.message || 'Network connection failed. Please check server connectivity.');
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // Received non-JSON response (e.g., HTML fallback or server error page)
    const text = await response.text();
    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
        authStorage.clear();
        window.dispatchEvent(new CustomEvent('gue:unauthorized'));
      }
      // Extract informative error message from HTML if present
      let extractedMessage = response.statusText;
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      const h1Match = text.match(/<h1>(.*?)<\/h1>/i);
      if (titleMatch?.[1]) {
        extractedMessage = titleMatch[1].trim();
      } else if (h1Match?.[1]) {
        extractedMessage = h1Match[1].trim();
      }
      throw new Error(`Server error (${response.status}): ${extractedMessage || 'Endpoint or service unavailable'}`);
    }
    throw new Error('Unexpected response format received from server.');
  }

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      authStorage.clear();
      window.dispatchEvent(new CustomEvent('gue:unauthorized'));
    }
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Public
  async verifyToken(token: string): Promise<PublicVerificationResult> {
    return request<PublicVerificationResult>(`/api/verify/${encodeURIComponent(token)}`);
  },

  async getPublicSettings(): Promise<{ settings: SystemSettings }> {
    return request<{ settings: SystemSettings }>('/api/settings');
  },

  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    authStorage.clear();
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async getUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/api/auth/users');
  },

  async createUser(payload: any): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUser(id: string, payload: any): Promise<{ user: User }> {
    return request<{ user: User }>(`/api/auth/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Staff
  async getStaffList(params?: {
    search?: string;
    departmentId?: string;
    status?: string;
    employmentType?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ total: number; staff: Staff[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.departmentId) query.set('departmentId', params.departmentId);
    if (params?.status) query.set('status', params.status);
    if (params?.employmentType) query.set('employmentType', params.employmentType);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    return request<{ total: number; staff: Staff[] }>(`/api/staff?${query.toString()}`);
  },

  async getStaffById(id: string): Promise<{ staff: Staff }> {
    return request<{ staff: Staff }>(`/api/staff/${id}`);
  },

  async getNextStaffId(deptCode = 'STC'): Promise<{ nextStaffId: string }> {
    return request<{ nextStaffId: string }>(`/api/staff/next-id?deptCode=${deptCode}`);
  },

  async createStaff(payload: Partial<Staff>): Promise<{ staff: Staff }> {
    return request<{ staff: Staff }>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStaff(id: string, payload: Partial<Staff>): Promise<{ staff: Staff }> {
    return request<{ staff: Staff }>(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async updateStaffStatus(id: string, status: string, reason: string): Promise<{ staff: Staff }> {
    return request<{ staff: Staff }>(`/api/staff/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  async deleteStaff(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/staff/${id}`, {
      method: 'DELETE',
    });
  },

  async getStaffQr(id: string): Promise<{
    qrDataUrl: string;
    verificationUrl: string;
    token: string;
    status: string;
  }> {
    return request<{
      qrDataUrl: string;
      verificationUrl: string;
      token: string;
      status: string;
    }>(`/api/staff/${id}/qr`);
  },

  async regenerateToken(id: string, reason?: string): Promise<{ staff: Staff; token: string }> {
    return request<{ staff: Staff; token: string }>(`/api/staff/${id}/regenerate-token`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async revokeToken(id: string, reason: string): Promise<{ staff: Staff }> {
    return request<{ staff: Staff }>(`/api/staff/${id}/revoke-token`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getBatchCards(staffIds: string[]): Promise<{
    cards: Array<{
      staff: Staff;
      qrDataUrl: string;
      verificationUrl: string;
    }>;
  }> {
    return request<{
      cards: Array<{
        staff: Staff;
        qrDataUrl: string;
        verificationUrl: string;
      }>;
    }>('/api/staff/batch-cards', {
      method: 'POST',
      body: JSON.stringify({ staffIds }),
    });
  },

  async importStaffCsv(rows: any[]): Promise<{
    success: boolean;
    importedCount: number;
    errors: string[];
    imported: Staff[];
  }> {
    return request<{
      success: boolean;
      importedCount: number;
      errors: string[];
      imported: Staff[];
    }>('/api/staff/import-csv', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });
  },

  // Departments & Units
  async getDepartments(): Promise<{ departments: Department[]; units: Unit[] }> {
    return request<{ departments: Department[]; units: Unit[] }>('/api/departments');
  },

  async createDepartment(payload: Partial<Department>): Promise<{ department: Department }> {
    return request<{ department: Department }>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Verification & Audit Logs
  async getVerificationLogs(limit = 150): Promise<{ logs: VerificationLog[] }> {
    return request<{ logs: VerificationLog[] }>(`/api/verification/logs?limit=${limit}`);
  },

  async getVerificationStats(): Promise<{
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    breakdown: {
      verified: number;
      invalid: number;
      inactiveOrSuspended: number;
    };
    recent: VerificationLog[];
  }> {
    return request<any>('/api/verification/stats');
  },

  async getAuditLogs(limit = 150): Promise<{ logs: AuditLog[] }> {
    return request<{ logs: AuditLog[] }>(`/api/audit-logs?limit=${limit}`);
  },

  // Documents
  async getStaffDocuments(staffId: string): Promise<{ documents: StaffDocument[] }> {
    return request<{ documents: StaffDocument[] }>(`/api/staff/${staffId}/documents`);
  },

  async uploadStaffDocument(staffId: string, payload: Partial<StaffDocument>): Promise<{ document: StaffDocument }> {
    return request<{ document: StaffDocument }>(`/api/staff/${staffId}/documents`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteDocument(docId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/documents/${docId}`, {
      method: 'DELETE',
    });
  },

  // Reports
  async getReportsSummary(): Promise<any> {
    return request<any>('/api/reports/summary');
  },

  // Settings
  async getSettings(): Promise<{ settings: SystemSettings }> {
    return request<{ settings: SystemSettings }>('/api/settings');
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ settings: SystemSettings }> {
    return request<{ settings: SystemSettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async restoreBackup(backupJson: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/settings/restore', {
      method: 'POST',
      body: JSON.stringify({ backupJson }),
    });
  },
};
