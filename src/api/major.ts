import instance from "./axios";
import type {
  MajorCreateRequest,
  MajorUpdateRequest,
  MajorStatus,
} from "../types/major";

export interface Major {
  id: number;
  name: string;
  status: string;
}

export interface MajorsResponse {
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

export interface MajorDetailResponse {
  code: number;
  message: string;
  result: Major;
}

export const getMajors = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => instance.get("/majors", { params });

export const getAllMajors = async (
  page = 0,
  size = 20
): Promise<MajorsResponse> => {
  const response = await instance.get<MajorsResponse>(
    `/majors?page=${page}&size=${size}`
  );
  return response.data;
};

export const getMajorById = async (
  id: number
): Promise<MajorDetailResponse> => {
  const response = await instance.get<MajorDetailResponse>(`/majors/${id}`);
  return response.data;
};

export const createMajor = (data: MajorCreateRequest) =>
  instance.post("/majors", data);

export const updateMajor = (id: number, data: MajorUpdateRequest) =>
  instance.put(`/majors/${id}`, data);

export const updateMajorStatus = (id: number, status: MajorStatus) =>
  instance.patch(`/majors/${id}/status`, { status });

export const deleteMajor = (id: number) => instance.delete(`/majors/${id}`);
