export type MajorStatus = "ACTIVE" | "DELETED";

export interface Major {
  id: number;
  code: string;
  name: string;
  description: string;
  status: MajorStatus;
}

export interface MajorCreateRequest {
  code: string;
  name: string;
  description: string;
}

export interface MajorUpdateRequest extends MajorCreateRequest {
  status?: MajorStatus;
}

export interface MajorPaginatedResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: Major[];
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
