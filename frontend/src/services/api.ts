// API service layer for Time Tracker application
import { User, Project, TimeEntry, UserRole } from '@/data/dummyData';

// Base configuration - Environment-based API URL
const API_BASE_URL = typeof __API_BASE_URL__ !== 'undefined' 
  ? __API_BASE_URL__ 
  : 'https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/api';

// Error handling utility
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

// Base API client
class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = TokenManager.getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Token ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.detail || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new ApiError(response.status, errorMessage);
      }

      // Handle empty responses
      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// Authentication Service
export class AuthService {
  static async login(email: string, password: string): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/login/', {
      email,
      password,
    });
    
    TokenManager.setToken(response.token);
    return response;
  }

  static async signup(userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    return apiClient.post<User>('/signup/', userData);
  }

  static async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/profile/');
  }

  static async updateProfile(userData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/profile/update/', userData);
  }

  static logout(): void {
    TokenManager.removeToken();
  }

  static isAuthenticated(): boolean {
    return TokenManager.getToken() !== null;
  }
}

// User Management Service  
export class UserService {
  static async getAllUsers(filters?: {
    role?: 'admin' | 'user';
    is_active?: boolean;
  }): Promise<User[]> {
    let endpoint = '/users/';
    const params = new URLSearchParams();
    
    if (filters?.role) params.append('role', filters.role);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    
    // Add cache-busting timestamp to ensure fresh data
    params.append('_t', Date.now().toString());
    
    endpoint += `?${params.toString()}`;
    
    return apiClient.get<User[]>(endpoint);
  }

  static async getUserById(id: string | number): Promise<User> {
    return apiClient.get<User>(`/users/${id}/`);
  }

  static async createUser(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    is_admin?: boolean;
  }): Promise<User> {
    return apiClient.post<User>('/users/', userData);
  }

  static async updateUser(id: string | number, userData: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/users/${id}/`, userData);
  }

  static async deactivateUser(id: string | number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/${id}/`);
  }
}

// Project Service
export class ProjectService {
  static async getAllProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects/');
  }

  static async getProjectById(id: string | number): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}/`);
  }

  static async createProject(projectData: {
    name: string;
    client: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Project> {
    return apiClient.post<Project>('/projects/', projectData);
  }

  static async updateProject(id: string | number, projectData: Partial<Project>): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}/`, projectData);
  }

  static async deleteProject(id: string | number): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}/`);
  }
}

// Project Assignment Service
export class ProjectAssignmentService {
  static async assignUsersToProject(
    projectId: string | number,
    userIds: (string | number)[],
    notes?: string
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    return apiClient.post(`/projects/${projectId}/assign/`, {
      user_ids: userIds,
      notes: notes || '',
    });
  }

  static async unassignUsersFromProject(
    projectId: string | number,
    userIds: (string | number)[],
    notes?: string
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    return apiClient.post(`/projects/${projectId}/unassign/`, {
      user_ids: userIds,
      notes: notes || '',
    });
  }

  static async getProjectAssignments(projectId: string | number): Promise<{
    project: Project;
    assignments: Array<{
      id: number;
      user: User;
      assigned_by: User;
      assigned_date: string;
      is_active: boolean;
      notes: string;
    }>;
  }> {
    return apiClient.get(`/projects/${projectId}/assignments/`);
  }

  static async getUserProjects(userId: string | number): Promise<{
    user: User;
    projects: Project[];
  }> {
    return apiClient.get(`/users/${userId}/projects/`);
  }

  static async getAssignmentStats(): Promise<{
    total_projects: number;
    total_assignments: number;
    users_with_projects: number;
    projects_with_users: number;
    avg_users_per_project: number;
    avg_projects_per_user: number;
  }> {
    return apiClient.get('/assignments/stats/');
  }
}

// Time Tracking Service
export class TimeTrackingService {
  static async getAllTimeEntries(filters?: {
    date?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<TimeEntry[]> {
    let endpoint = '/hours/';
    const params = new URLSearchParams();
    
    if (filters?.date) params.append('date', filters.date);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    return apiClient.get<TimeEntry[]>(endpoint);
  }

  static async getTimeEntryById(id: string | number): Promise<TimeEntry> {
    return apiClient.get<TimeEntry>(`/hours/${id}/`);
  }

  static async createTimeEntry(entryData: {
    project: string | number;
    date: string;
    hours: number;
    note?: string;
  }): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>('/hours/', entryData);
  }

  static async updateTimeEntry(id: string | number, entryData: Partial<TimeEntry>): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/hours/${id}/`, entryData);
  }

  static async deleteTimeEntry(id: string | number): Promise<void> {
    return apiClient.delete<void>(`/hours/${id}/`);
  }
}

// Export all services
export {
  TokenManager,
  ApiClient,
}; 