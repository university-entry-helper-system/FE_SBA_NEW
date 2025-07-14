import axios from "./axios";
import type {
  UniversityCategory,
  UniversityCategoryCreateRequest,
  UniversityCategoryUpdateRequest,
  UniversityCategoryPaginatedResponse,
  ApiResponse,
} from "../types/universityCategory";

const BASE_URL = "/university-categories";

// Lấy danh sách loại trường (phân trang)
export const getUniversityCategoriesPaginated = (params: {
  page?: number;
  size?: number;
}) =>
  axios.get<UniversityCategoryPaginatedResponse>(`${BASE_URL}/paginated`, {
    params,
  });

// Lấy chi tiết loại trường theo ID
export const getUniversityCategoryDetail = (id: number) =>
  axios.get<ApiResponse<UniversityCategory>>(`${BASE_URL}/${id}`);

// Tạo loại trường mới
export const createUniversityCategory = (
  data: UniversityCategoryCreateRequest
) => axios.post<ApiResponse<UniversityCategory>>(BASE_URL, data);

// Cập nhật loại trường
export const updateUniversityCategory = (
  id: number,
  data: UniversityCategoryUpdateRequest
) => axios.put<ApiResponse<UniversityCategory>>(`${BASE_URL}/${id}`, data);

// Xóa loại trường
export const deleteUniversityCategory = (id: number) =>
  axios.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);
