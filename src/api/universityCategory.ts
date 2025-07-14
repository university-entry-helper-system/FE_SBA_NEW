import axios from "./axios";
import type {
  UniversityCategory,
  UniversityCategoryCreateRequest,
  UniversityCategoryUpdateRequest,
  UniversityCategoryPaginatedResponse,
  ApiResponse,
} from "../types/universityCategory";

// Lấy danh sách loại trường (phân trang)
export const getUniversityCategoriesPaginated = (params: {
  page?: number;
  size?: number;
}) =>
  axios.get<UniversityCategoryPaginatedResponse>(
    "/api/v1/university-categories/paginated",
    { params }
  );

// Lấy chi tiết loại trường theo ID
export const getUniversityCategoryDetail = (id: number) =>
  axios.get<ApiResponse<UniversityCategory>>(
    `/api/v1/university-categories/${id}`
  );

// Tạo loại trường mới
export const createUniversityCategory = (
  data: UniversityCategoryCreateRequest
) =>
  axios.post<ApiResponse<UniversityCategory>>(
    "/api/v1/university-categories",
    data
  );

// Cập nhật loại trường
export const updateUniversityCategory = (
  id: number,
  data: UniversityCategoryUpdateRequest
) =>
  axios.put<ApiResponse<UniversityCategory>>(
    `/api/v1/university-categories/${id}`,
    data
  );

// Xóa loại trường
export const deleteUniversityCategory = (id: number) =>
  axios.delete<ApiResponse<null>>(`/api/v1/university-categories/${id}`);
