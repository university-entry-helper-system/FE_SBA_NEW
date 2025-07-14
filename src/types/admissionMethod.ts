export type AdmissionMethodStatus = "ACTIVE" | "DELETED";

export interface AdmissionMethod {
  id: number;
  name: string;
  description: string;
  status: AdmissionMethodStatus;
}

export interface AdmissionMethodCreateRequest {
  name: string;
  description: string;
}

export interface AdmissionMethodUpdateRequest
  extends AdmissionMethodCreateRequest {
  status?: AdmissionMethodStatus;
}

export interface AdmissionMethodPaginatedResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: AdmissionMethod[];
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
