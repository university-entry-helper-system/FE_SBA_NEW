// Định nghĩa enum cho status
export type CampusTypeStatus = "active" | "inactive" | "deleted";

// Định nghĩa type cho CampusType
export interface CampusType {
  id: number;
  name: string;
  description: string;
  status: CampusTypeStatus;
}

// Request tạo/cập nhật
export interface CampusTypeCreateRequest {
  name: string;
  description: string;
}

export interface CampusTypeUpdateRequest {
  name: string;
  description: string;
}

// Response phân trang
export interface CampusTypePage {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: CampusType[];
}
