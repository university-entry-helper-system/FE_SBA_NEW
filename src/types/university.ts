export interface Province {
  id: number;
  name: string;
  description: string;
  region: string;
}

export interface UniversityCategory {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UniversityCampus {
  // Định nghĩa trường cần thiết cho campus nếu dùng
  id: number;
  name: string;
  address: string;
  // ... các trường khác nếu có
}

export type UniversityStatus = "active" | "inactive" | "deleted";

export interface University {
  id: number;
  universityCode: string;
  name: string;
  nameEn: string;
  shortName: string;
  logoUrl?: string;
  fanpage?: string;
  foundingYear?: number;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  status: UniversityStatus;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  categoryId?: number;
  category?: UniversityCategory;
  admissionMethodIds?: number[];
  campusCount?: number;
  campuses?: UniversityCampus[];
}

export type UniversityListItem = University;

export interface UniversityListResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: UniversityListItem[];
  };
}

export interface UniversityDetailResponse {
  code: number;
  message: string;
  result: University;
}

export interface UniversityCreateRequest {
  universityCode: string;
  name: string;
  nameEn: string;
  shortName: string;
  logoUrl?: string;
  fanpage?: string;
  foundingYear?: number;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  categoryId?: number;
}

export type UniversityUpdateRequest = UniversityCreateRequest;

export interface UniversityPage {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: University[];
}
