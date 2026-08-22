export const API_ROUTES = {
  health: "/health",
  auth: {
    login: "/api/v1/auth/login",
  },
  attendance: {
    checkIn: "/api/v1/attendance/check-in",
    checkOut: "/api/v1/attendance/check-out",
    mine: "/api/v1/attendance/me",
    list: "/api/v1/attendance",
  },
  departments: {
    list: "/api/v1/departments",
    byId: (id: string) => `/api/v1/departments/${id}`,
  },
  employees: {
    list: "/api/v1/employees",
    byId: (id: string) => `/api/v1/employees/${id}`,
  },
  leaveRequests: {
    list: "/api/v1/leave-requests",
    mine: "/api/v1/leave-requests/me",
    approve: (id: string) => `/api/v1/leave-requests/${id}/approve`,
    reject: (id: string) => `/api/v1/leave-requests/${id}/reject`,
  },
} as const;
