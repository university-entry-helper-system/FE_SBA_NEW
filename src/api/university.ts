import axios from "./axios";
import type {
  UniversityListResponse,
  UniversityDetailResponse,
} from "../types/university";

const BASE_URL = "/universities";

export const getUniversities = (params?: {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  categoryId?: number;
  provinceId?: number;
}) => {
  return axios.get<UniversityListResponse>(BASE_URL, { params });
};

export const getUniversityDetail = (id: number) => {
  return axios.get<UniversityDetailResponse>(`${BASE_URL}/${id}`);
};

export const createUniversity = (data: unknown, isMultipart = false) => {
  return axios.post(
    BASE_URL,
    data,
    isMultipart
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );
};

export const updateUniversity = (
  id: number,
  data: unknown,
  isMultipart = false
) => {
  return axios.put(
    `${BASE_URL}/${id}`,
    data,
    isMultipart
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );
};

export const deleteUniversity = (id: number) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

export const updateUniversityStatus = (id: number, status: string) => {
  return axios.patch(`${BASE_URL}/${id}/status`, { status });
};
