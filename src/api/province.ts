import axios from "./axios";
import type {
  Province,
  ProvinceCreateRequest,
  ProvinceUpdateRequest,
  ProvinceListResponse,
  ApiResponse,
} from "../types/province";

const BASE_URL = "/provinces";

// Lấy danh sách tỉnh/thành
export const getProvinces = () => axios.get<ProvinceListResponse>(BASE_URL);

// Lấy chi tiết tỉnh/thành theo ID
export const getProvinceDetail = (id: number) =>
  axios.get<ApiResponse<Province>>(`${BASE_URL}/${id}`);

// Tạo tỉnh/thành mới
export const createProvince = (data: ProvinceCreateRequest) =>
  axios.post<ApiResponse<Province>>(BASE_URL, data);

// Cập nhật tỉnh/thành
export const updateProvince = (id: number, data: ProvinceUpdateRequest) =>
  axios.put<ApiResponse<Province>>(`${BASE_URL}/${id}`, data);

// Xóa tỉnh/thành
export const deleteProvince = (id: number) =>
  axios.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);
