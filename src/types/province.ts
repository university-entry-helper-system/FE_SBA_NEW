export interface Province {
  id: number;
  name: string;
  region: string;
}

export interface ProvinceCreateRequest {
  name: string;
  region: string;
}

export type ProvinceUpdateRequest = ProvinceCreateRequest;

export interface ProvinceListResponse {
  code: number;
  message: string;
  result: Province[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
