import instance from "./axios";
import type {
  AdmissionMethodCreateRequest,
  AdmissionMethodUpdateRequest,
  AdmissionMethodStatus,
} from "../types/admissionMethod";

export const getAdmissionMethods = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => instance.get("/admission-methods", { params });

export const getAdmissionMethod = (id: number) =>
  instance.get(`/admission-methods/${id}`);

export const createAdmissionMethod = (data: AdmissionMethodCreateRequest) =>
  instance.post("/admission-methods", data);

export const updateAdmissionMethod = (
  id: number,
  data: AdmissionMethodUpdateRequest
) => instance.put(`/admission-methods/${id}`, data);

export const updateAdmissionMethodStatus = (
  id: number,
  status: AdmissionMethodStatus
) => instance.patch(`/admission-methods/${id}/status`, { status });

export const deleteAdmissionMethod = (id: number) =>
  instance.delete(`/admission-methods/${id}`);

export const getUniversitiesByAdmissionMethod = async (methodId: string) => {
  return await instance.get(`/university-admission-methods/methods/${methodId}`);
};

export const getAdmissionMethodsByUniversity = async (universityId: number) => {
  return await instance.get(`/university-admission-methods/schools/${universityId}`);
};
