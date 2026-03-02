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
  delete: (roleId: number) => api.delete(`/roles/${roleId}`),
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
  city?: string | null;
  address?: string | null;
  datecreated: string;
  active: number;
  note?: string | null;
  status?: string | null;
  type?: string | null;
  permissions: object;
}

/// Update customersApi to accept query parameters
export const customersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);

  return api.get<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    permissions: {
      canCreate: boolean;
      canDelete: boolean;
      updateableFields: string[];
    };
  }>(`/customers?${queryParams.toString()}`);
},
  getById: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => api.post("/customers", data),
  update: (id: number, data: Partial<Customer>) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  
getAllForExport: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<Customer[]>(`/customers/export/all${query}`);
  },

};


// Contacts
export interface Contact {
  id: number;
  userid: number; // company/customer ID this contact belongs to
  is_primary: number; // 1 for primary contact, 0 for secondary
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  title: string;
  datecreated: string;
  active: number;
}

export interface ContactsResponse {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const contactsApi = {
  // Get all contacts for a company (paginated + search)
  listForCompany: (userid: number, params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<ContactsResponse>(`/contacts/company/${userid}${query ? `?${query}` : ''}`);
  },

  // Get single contact by ID
  getById: (id: number) => 
    api.get<Contact>(`/contacts/${id}`),

  // Create new contact
  create: (data: Partial<Contact>) => 
    api.post<{ id: number; message: string }>("/contacts", data),

  // Update contact
  update: (id: number, data: Partial<Contact>) => 
    api.put<{ message: string }>(`/contacts/${id}`, data),

  // Delete single contact
  delete: (id: number) => 
    api.delete<{ message: string }>(`/contacts/${id}`),

  // Delete all contacts of a company
  deleteAllForCompany: (userid: number) => 
    api.delete<{ message: string }>(`/contacts/company/${userid}`),

};


// E:\SVG\crm\frontend\src\lib\api.ts (add this to your existing api.ts)

// Service type
export interface ServiceType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  created_by_name?: string;
  updated_by_name?: string;
}

export interface ServiceTypesResponse {
  data: ServiceType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const serviceTypesApi = {
 
  getAll: () => 
   api.get<ServiceType[]>("/service-types/all"),

  // Get single service type by ID
  getById: (id: number) => 
    api.get<ServiceType>(`/service-types/${id}`),

  // Create new service type
  create: (data: { name: string }) => 
    api.post<{ id: number; message: string }>("/service-types", data),

  // Update service type
  update: (id: number, data: { name: string }) => 
    api.put<{ message: string }>(`/service-types/${id}`, data),

  // Delete single service type
  delete: (id: number) => 
    api.delete<{ message: string }>(`/service-types/${id}`),

  // Delete all service types
  deleteAll: () => 
    api.delete<{ message: string }>("/service-types"),
};

// Jobs

export interface Job {
  id: number;
  jobno: string;
  customer_id: number;
  customer_name?: string;
  req_date: string;
  schedule_date: string;
  staff_id: number;
  staff_name?: string;
  status: "Pending" | "Completed" | "Cancelled" | "Rescheduled";
  created_at: string;
}

export interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const jobsApi = {

  // 🔹 Get all jobs (pagination + search)
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    return api.get(`/jobschedule?${queryParams.toString()}`);
  },

  // 🔹 Get single job
  getById: (id: number) => api.get(`/jobschedule/${id}`),

  // 🔹 Create job
 create: (data: {
  customer_id: number;
  jobno: string;          // <-- required
  req_date: string;
  schedule_date: string;
  staff_id: number;
  reason?: string;        // <-- optional
}) => api.post("/jobschedule", data),

  // 🔹 Update status
  updateStatus: (id: number, status: string) =>
    api.put(`/jobschedule/${id}/status`, { status }),

  // 🔹 Reschedule job
  reschedule: (id: number, data: { new_schedule_date: string; staff_id: number; reason?: string }) =>
    api.post(`/jobschedule/${id}/reschedule`, data),

  // 🔹 Delete job
  delete: (id: number) => api.delete(`/jobschedule/${id}`),

  // ✅ Customers
  listCustomers: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    return api.get(`/customers?${queryParams.toString()}`);
  },

  // ✅ Staff
  listStaff: () => api.get(`/staff`),
};
export default api;
