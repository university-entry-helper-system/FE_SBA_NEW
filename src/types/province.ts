export type ProvinceRegion = "BAC" | "TRUNG" | "NAM";
export type ProvinceStatus = "ACTIVE" | "DELETED";

export interface Province {
  id: number;
  name: string;
  description: string;
  region: ProvinceRegion;
  status: ProvinceStatus;
}

export interface ProvinceCreateRequest {
  name: string;
  description: string;
  region: ProvinceRegion;
}

export interface ProvinceUpdateRequest extends ProvinceCreateRequest {
  status?: ProvinceStatus;
}

export interface ProvincePaginatedResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: Province[];
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
