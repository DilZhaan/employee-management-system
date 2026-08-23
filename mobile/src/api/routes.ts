export const API_ROUTES = {
  auth: {
    login: "/api/v1/auth/login",
  },
  attendance: {
    checkIn: "/api/v1/attendance/check-in",
    checkOut: "/api/v1/attendance/check-out",
    mine: "/api/v1/attendance/me",
  },
  leaveRequests: {
    list: "/api/v1/leave-requests",
    mine: "/api/v1/leave-requests/me",
    approve: (id: string) => `/api/v1/leave-requests/${id}/approve`,
    reject: (id: string) => `/api/v1/leave-requests/${id}/reject`,
  },
} as const;
