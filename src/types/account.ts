// Role interface matching database schema
export interface Role {
  id: number;
  name: "USER" | "CONSULTANT" | "ADMIN";
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Account status matching database constraints
export type AccountStatus = "ACTIVE" | "INACTIVE" | "BANNED";

// Gender matching database constraints
export type Gender = "MALE" | "FEMALE" | "OTHER";

// Account interface matching database schema
export interface Account {
  // Primary fields from database
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  dob?: string; // Date of birth
  gender?: Gender;
  status: AccountStatus;
  password?: string; // Never returned in responses
  isDeleted: boolean;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;

  // Audit fields
  createdBy?: string;
  updatedBy?: string;

  // Activity fields
  loginCount?: number;

  // Relationships
  role?: Role | null; // Single role (legacy)
  roles?: Role[]; // Multiple roles (current)
}

// Request DTOs
export interface AccountCreateRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  dob?: string;
  gender?: Gender;
  roleIds?: number[];
}

export interface AccountUpdateRequest {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  dob?: string;
  gender?: Gender;
  status?: AccountStatus;
  roleIds?: number[];
}

// Search and filter parameters
export interface AccountSearchParams {
  // Basic pagination
  page?: number;
  size?: number;
  sort?: string; // e.g., "createdAt,DESC" or "fullName,ASC" (for basic search)

  // Advanced search sorting (for advanced-search endpoint)
  sortBy?:
    | "id"
    | "username"
    | "email"
    | "fullName"
    | "phone"
    | "status"
    | "gender"
    | "createdAt"
    | "updatedAt"
    | "lastLoginAt"
    | "loginCount";
  sortOrder?: "ASC" | "DESC";

  // Search
  search?: string;
  searchBy?: "full_name" | "email" | "username" | "phone";

  // Filters
  role?: "USER" | "CONSULTANT" | "ADMIN";
  status?: AccountStatus;
  gender?: Gender;
  isDeleted?: boolean;

  // Date range filters (ISO 8601 format)
  createdDateFrom?: string;
  createdDateTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;

  // Advanced filters
  minLoginCount?: number;
  maxLoginCount?: number;
  hasPhone?: boolean;
  emailVerified?: boolean;
}

// Response DTOs matching actual API structure
export interface AccountResponse {
  code: number;
  message: string;
  result: {
    items: Account[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
  };
}

export interface AccountDetailResponse {
  code: number;
  message: string;
  result: Account;
}

// Activity Log
export interface ActivityLog {
  action:
    | "LOGIN"
    | "LOGOUT"
    | "UPDATE_PROFILE"
    | "PASSWORD_CHANGE"
    | "ROLE_CHANGE"
    | "STATUS_CHANGE";
  timestamp: string;
  ip?: string;
  device?: string;
  details?: Record<string, unknown>;
}

export interface ActivityLogResponse {
  code: number;
  message: string;
  result: {
    items: ActivityLog[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
  };
}

// Login History
export interface LoginHistory {
  timestamp: string;
  ip: string;
  device?: string;
  success: boolean;
  location?: string;
}

export interface LoginHistoryResponse {
  code: number;
  message: string;
  result: {
    items: LoginHistory[];
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
  };
}

// Password Strength
export interface PasswordStrength {
  score: number; // 0-5
  level: "VERY_WEAK" | "WEAK" | "MEDIUM" | "STRONG" | "VERY_STRONG";
  suggestions: string[];
}

// Bulk Action
export interface BulkActionRequest {
  action:
    | "ACTIVATE"
    | "DEACTIVATE"
    | "BAN"
    | "UNBAN"
    | "DELETE"
    | "RESTORE"
    | "EXPORT"
    | "SEND_NOTIFICATION";
  ids: string[];
  notification?: {
    title: string;
    content: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  };
  exportFormat?: "excel" | "csv";
}

export interface BulkActionResponse {
  code: number;
  message: string;
  result: {
    affected: number;
    success: string[];
    failed: string[];
    errors?: { [key: string]: string };
  };
}

// Statistics
export interface AccountStats {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  deleted: number;
  byRole: {
    user: number;
    consultant: number;
    admin: number;
  };
  byGender: {
    male: number;
    female: number;
    other: number;
    unknown: number;
  };
  recentRegistrations: number; // Last 30 days
  recentLogins: number; // Last 24 hours
}

// API Response wrapper
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Error types
export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

// Form validation
export interface AccountFormErrors {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  roleIds?: string;
}

// Display helpers
export interface AccountDisplayOptions {
  showDeleted?: boolean;
  showPassword?: boolean;
  showAuditFields?: boolean;
  compactView?: boolean;
  groupByRole?: boolean;
}

// Export options
export interface ExportOptions {
  format: "excel" | "csv" | "pdf";
  fields: string[];
  filters?: AccountSearchParams;
  template?: "basic" | "detailed" | "audit";
}

// Notification
export interface NotificationRequest {
  userIds: string[];
  notification: {
    title: string;
    content: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    scheduledAt?: string; // ISO 8601
  };
}

// Search suggestions
export interface SearchSuggestion {
  value: string;
  label: string;
  count: number;
  type: "username" | "email" | "fullName" | "phone";
}

// Filter state for UI
export interface FilterState {
  search: string;
  searchBy: "full_name" | "email" | "username" | "phone";
  role: string;
  status: string;
  gender: string;
  dateRange: {
    from: string;
    to: string;
    type: "created" | "lastLogin";
  };
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  showDeleted: boolean;
}

// UI State
export interface AccountUIState {
  loading: boolean;
  error: string;
  success: string;
  selectedIds: string[];
  showFilters: boolean;
  showBulkActions: boolean;
  currentView: "table" | "grid" | "compact";
  filters: FilterState;
}

// Constants
export const ROLES = {
  USER: { id: 1, name: "USER", label: "Người dùng" },
  CONSULTANT: { id: 2, name: "CONSULTANT", label: "Tư vấn viên" },
  ADMIN: { id: 3, name: "ADMIN", label: "Quản trị viên" },
} as const;

export const STATUSES = {
  ACTIVE: { value: "ACTIVE", label: "Hoạt động", color: "green" },
  INACTIVE: { value: "INACTIVE", label: "Tạm khóa", color: "orange" },
  BANNED: { value: "BANNED", label: "Bị cấm", color: "red" },
} as const;

export const GENDERS = {
  MALE: { value: "MALE", label: "Nam" },
  FEMALE: { value: "FEMALE", label: "Nữ" },
  OTHER: { value: "OTHER", label: "Khác" },
} as const;
