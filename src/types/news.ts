// News status
export type NewsStatus = "Published" | "Draft" | "Pending" | "Rejected";

// News category (có thể mở rộng)
export type NewsCategory = string;

// UniversityResponse (rút gọn, dùng lại type nếu đã có)
export interface UniversityShort {
  id: number;
  name: string;
  shortName?: string;
  logoUrl?: string;
}

// NewsResponse (theo backend)
export interface NewsResponse {
  id: number;
  university?: UniversityShort;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  category: NewsCategory;
  viewCount: number;
  newsStatus: NewsStatus;
  publishedAt?: string;
  status: "ACTIVE" | "DELETED";
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// NewsRequest (tạo/sửa)
export interface NewsRequest {
  universityId: number;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  image?: File | null;
  imageUrl?: string;
  newsStatus?: NewsStatus;
  publishedAt?: string;
}

// Phân trang
export interface NewsPage {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: NewsResponse[];
}

// Chế độ form
export type NewsFormMode = "create" | "edit" | "view"; 