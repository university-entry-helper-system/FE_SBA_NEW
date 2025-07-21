import axios from "./axios";
import type { UniversityMajor, UniversityMajorRequest } from "../types/universityMajor";

const BASE_URL = "/university-majors";

export interface UniversityMajorResponse {
  code: number;
  message: string;
  result: UniversityMajor;
}

export const getUniversityMajor = (id: number) =>
  axios.get<UniversityMajorResponse>(`${BASE_URL}/${id}`);

export const updateUniversityMajor = (id: number, data: UniversityMajorRequest) =>
  axios.put(`${BASE_URL}/${id}`, data);

export const deleteUniversityMajor = (id: number) =>
  axios.delete(`${BASE_URL}/${id}`);

export interface UniversityMajorListResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: UniversityMajor[];
  };
}

export const getAllUniversityMajors = (
  universityId: number,
  params?: { name?: string; page?: number; size?: number }
) =>
  axios.get<UniversityMajorListResponse>(
    `/university-majors/uni/${universityId}`,
    { params }
  );

export const createUniversityMajor = (data: UniversityMajorRequest) =>
  axios.post(BASE_URL, data); 