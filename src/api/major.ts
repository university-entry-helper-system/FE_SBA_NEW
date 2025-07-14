import instance from "./axios";
import type {
  MajorCreateRequest,
  MajorUpdateRequest,
  MajorStatus,
} from "../types/major";

export const getMajors = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => instance.get("/majors", { params });

export const getMajor = (id: number) => instance.get(`/majors/${id}`);

export const createMajor = (data: MajorCreateRequest) =>
  instance.post("/majors", data);

export const updateMajor = (id: number, data: MajorUpdateRequest) =>
  instance.put(`/majors/${id}`, data);

export const updateMajorStatus = (id: number, status: MajorStatus) =>
  instance.patch(`/majors/${id}/status`, { status });

export const deleteMajor = (id: number) => instance.delete(`/majors/${id}`);
