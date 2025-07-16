import axios from "./axios";
import type {
  CampusCreateRequest,
  CampusUpdateRequest,
  Campus,
} from "../types/campus";

const BASE_URL = "/campuses";

export const getCampuses = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  universityId?: number;
  provinceId?: number;
  campusType?: string;
  isMainCampus?: boolean;
}) =>
  axios.get<{
    result: { items: Campus[]; totalPages: number; totalElements: number };
  }>(BASE_URL, { params });

export const getCampusById = (id: number) =>
  axios.get<{ result: Campus }>(`${BASE_URL}/${id}`);

export const createCampus = (data: CampusCreateRequest) =>
  axios.post<{ result: Campus }>(BASE_URL, data);

export const updateCampus = (id: number, data: CampusUpdateRequest) =>
  axios.put<{ result: Campus }>(`${BASE_URL}/${id}`, data);

export const deleteCampus = (id: number) => axios.delete(`${BASE_URL}/${id}`);

export const updateCampusStatus = (id: number, status: string) =>
  axios.patch<{ result: Campus }>(`${BASE_URL}/${id}/status`, { status });
