import axios from "./axios";
import type {
  University,
  UniversityCreateRequest,
  UniversityUpdateRequest,
  UniversityPage,
  UniversityStatus,
} from "../types/university";

const BASE_URL = "/universities";

export const getAllUniversities = () =>
  axios.get<{ result: University[] }>(BASE_URL);

export const getUniversityById = (id: number) =>
  axios.get<{ result: University }>(`${BASE_URL}/${id}`);

export const searchUniversities = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => axios.get<{ result: UniversityPage }>(BASE_URL, { params });

export const createUniversity = (
  data: UniversityCreateRequest | FormData,
  isMultipart = false
) =>
  axios.post<{ result: University }>(
    BASE_URL,
    data,
    isMultipart
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );

export const updateUniversity = (
  id: number,
  data: UniversityUpdateRequest | FormData,
  isMultipart = false
) =>
  axios.put<{ result: University }>(
    `${BASE_URL}/${id}`,
    data,
    isMultipart
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );

export const deleteUniversity = (id: number) =>
  axios.delete(`${BASE_URL}/${id}`);

export const updateUniversityStatus = (id: number, status: UniversityStatus) =>
  axios.patch<{ result: University }>(`${BASE_URL}/${id}/status`, { status });
