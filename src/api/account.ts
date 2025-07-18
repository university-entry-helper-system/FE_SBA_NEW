import axios from "./axios";
import type {
  AccountUpdateRequest,
  AccountSearchParams,
  AccountResponse,
} from "../types/account";

const BASE_URL = "/accounts";

// Enhanced search with advanced filters
export const getAccounts = async (params: AccountSearchParams = {}) => {
  const searchParams = new URLSearchParams();

  // Basic pagination
  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.size !== undefined)
    searchParams.append("size", params.size.toString());

  // Search parameters
  if (params.search) {
    searchParams.append("search", params.search);
    if (params.searchBy) searchParams.append("searchBy", params.searchBy);
  }

  // Filters
  if (params.role) searchParams.append("role", params.role);
  if (params.status) searchParams.append("status", params.status);
  if (params.gender) searchParams.append("gender", params.gender);
  if (params.isDeleted !== undefined)
    searchParams.append("isDeleted", params.isDeleted.toString());

  // Date range filters
  if (params.createdDateFrom)
    searchParams.append("createdDateFrom", params.createdDateFrom);
  if (params.createdDateTo)
    searchParams.append("createdDateTo", params.createdDateTo);
  if (params.lastLoginFrom)
    searchParams.append("lastLoginFrom", params.lastLoginFrom);
  if (params.lastLoginTo)
    searchParams.append("lastLoginTo", params.lastLoginTo);

  // Use advanced search endpoint if any filters are present
  const hasFilters =
    params.search ||
    params.role ||
    params.status ||
    params.gender ||
    params.isDeleted !== undefined ||
    params.createdDateFrom ||
    params.createdDateTo ||
    params.lastLoginFrom ||
    params.lastLoginTo;

  const endpoint = hasFilters ? `${BASE_URL}/advanced-search` : BASE_URL;

  // Handle sorting differently for advanced search vs basic search
  if (hasFilters) {
    // Advanced search uses sortBy and sortOrder separately
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);
  } else {
    // Basic search uses sort parameter
    if (params.sort) searchParams.append("sort", params.sort);
  }

  const url = `${endpoint}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  return axios.get<AccountResponse>(url);
};

// Basic CRUD operations
export const createAccount = async (data: AccountUpdateRequest) =>
  axios.post(`${BASE_URL}`, data);

export const updateAccount = async (id: string, data: AccountUpdateRequest) =>
  axios.put(`${BASE_URL}/${id}`, data);

export const deleteAccount = async (id: string, hard: boolean = false) => {
  const params = hard ? "?hard=true" : "";
  return axios.delete(`${BASE_URL}/${id}${params}`);
};

// Get account details
export const getAccountDetails = async (id: string) =>
  axios.get(`${BASE_URL}/${id}`);

export const getAccountById = async (id: string) =>
  axios.get(`${BASE_URL}/${id}`);

export const setRole = async (
  accountId: string,
  action: "PROMOTE" | "DEMOTE"
) => axios.post(`${BASE_URL}/${accountId}/set-roles`, { action });

// Role management
export const assignRoles = async (accountId: string, roleIds: number[]) =>
  axios.post(`${BASE_URL}/${accountId}/set-roles`, { roleIds });

export const getAccountRoles = async (accountId: string) =>
  axios.get(`${BASE_URL}/${accountId}/roles`);

// Status management
export const toggleStatus = async (accountId: string) =>
  axios.patch(`${BASE_URL}/${accountId}/toggle-status`, {});

export const updateStatus = async (accountId: string, status: string) =>
  axios.patch(`${BASE_URL}/${accountId}/status`, { status });

export const banAccount = async (accountId: string, banned: boolean) =>
  axios.patch(`${BASE_URL}/${accountId}/ban`, { banned });

// Password management
export const resetPassword = async (accountId: string, newPassword: string) =>
  axios.post(`${BASE_URL}/${accountId}/reset-password`, { newPassword });

export const checkPasswordStrength = async (password: string) =>
  axios.post(`${BASE_URL}/check-password-strength`, { password });

// Bulk operations
export const bulkAction = async (
  action: string,
  ids: string[],
  notification?: Record<string, unknown>
) => {
  const data: Record<string, unknown> = { action, ids };
  if (notification) data.notification = notification;
  return axios.post(`${BASE_URL}/bulk-action`, data);
};

// Activity and history
export const getActivityLog = async (
  accountId: string,
  page: number = 0,
  size: number = 10
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  return axios.get(`${BASE_URL}/${accountId}/activity-log?${params}`);
};

export const getLoginHistory = async (
  accountId: string,
  page: number = 0,
  size: number = 10
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  return axios.get(`${BASE_URL}/${accountId}/login-history?${params}`);
};

// Restore deleted account
export const restoreAccount = async (accountId: string) =>
  axios.post(`${BASE_URL}/${accountId}/restore`, {});

// Current user operations
export const getCurrentUserInfo = async () => axios.get(`${BASE_URL}/my-info`);

export const updateCurrentUserProfile = async (data: AccountUpdateRequest) =>
  axios.put(`${BASE_URL}/my-info/update-profile`, data);

export const updateCurrentUserPassword = async (
  oldPassword: string,
  newPassword: string,
  confirmNewPassword: string
) =>
  axios.post(`${BASE_URL}/my-info/update-password`, {
    oldPassword,
    newPassword,
    confirmNewPassword,
  });

// Export functionality
export const exportAccounts = async (
  ids?: string[],
  format: "excel" | "csv" = "excel"
) => {
  const data: Record<string, unknown> = { format };
  if (ids && ids.length > 0) data.ids = ids;

  const response = await axios.post(`${BASE_URL}/export`, data, {
    responseType: "blob",
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `accounts-${new Date().toISOString().split("T")[0]}.${
      format === "excel" ? "xlsx" : "csv"
    }`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return response;
};

// Send notification to users
export const sendNotification = async (
  userIds: string[],
  notification: { title: string; content: string }
) => axios.post(`${BASE_URL}/send-notification`, { userIds, notification });

// Statistics
export const getAccountStats = async () => axios.get(`${BASE_URL}/stats`);

// Search suggestions
export const getSearchSuggestions = async (
  query: string,
  field: string = "full_name"
) => {
  const params = new URLSearchParams({ query, field });
  return axios.get(`${BASE_URL}/search-suggestions?${params}`);
};
