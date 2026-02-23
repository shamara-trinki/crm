import axios from "axios";

const API_BASE = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem("accessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ accessToken: string }>("/auth/login", { username, password }),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post<{ accessToken: string }>("/auth/refresh"),
};

// Users
export interface User {
  id: number;
  username: string;
  roleId: number; 
  role: string;
  is_active: number;
  created_at: string;
}

export const usersApi = {
  list: () => api.get<User[]>("/users"),
  create: (data: { username: string; password: string; roleId: number }) =>
    api.post("/users", data),
  delete: (userId: number) => api.delete(`/users/${userId}`),
  update: (userId: number, data: { username?: string; password?: string }) =>
    api.put(`/users/${userId}`, data),
  updateRole: (userId: number, roleId: number) =>
    api.put(`/users/${userId}/role`, { roleId }),
};

// Roles
export interface Permission {
  id: number;
  code: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export const rolesApi = {
  list: () => api.get<Role[]>("/roles"),
  create: (name: string) => api.post("/roles", { name }),
  assignPermissions: (roleId: number, permissions: number[]) =>
    api.post(`/roles/${roleId}/permissions`, { permissions }),
};

export const permissionsApi = {
  list: () => api.get<Permission[]>("/permissions"),
};

// Customers
export interface Customer {
  userid: number;
  company: string | null;
  phonenumber?: string | null;
  country?: number;
  city?: string | null;
  address?: string | null;
  datecreated: string;
  active: number;
  note?: string | null;
  status?: string | null;
  type?: string | null;
}

/// Update customersApi to accept query parameters
export const customersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{
      data: Customer[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/customers?${query}`);
  },
  getById: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => api.post("/customers", data),
  update: (id: number, data: Partial<Customer>) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};


export default api;
