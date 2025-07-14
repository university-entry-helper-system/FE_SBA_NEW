export interface UniversityCategory {
  id: number;
  name: string;
  description: string;
  status: "ACTIVE" | "DELETED";
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UniversityCategoryCreateRequest {
  name: string;
  description: string;
}

export type UniversityCategoryUpdateRequest = UniversityCategoryCreateRequest;

export interface UniversityCategoryPaginatedResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: UniversityCategory[];
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
