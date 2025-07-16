import axios from "./axios";
import type {
  CampusType,
  CampusTypeCreateRequest,
  CampusTypeUpdateRequest,
  CampusTypePage,
  CampusTypeStatus,
} from "../types/campusType";

const BASE_URL = "/campus-types";

export const getAllCampusTypes = () =>
  axios.get<{ result: CampusType[] }>(BASE_URL);

export const getCampusTypeById = (id: number) =>
  axios.get<{ result: CampusType }>(`${BASE_URL}/${id}`);

export const searchCampusTypes = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => axios.get<{ result: CampusTypePage }>(`${BASE_URL}/search`, { params });

export const createCampusType = (data: CampusTypeCreateRequest) =>
  axios.post<{ result: CampusType }>(BASE_URL, data);

export const updateCampusType = (id: number, data: CampusTypeUpdateRequest) =>
  axios.put<{ result: CampusType }>(`${BASE_URL}/${id}`, data);

export const deleteCampusType = (id: number) =>
  axios.delete(`${BASE_URL}/${id}`);

export const updateCampusTypeStatus = (id: number, status: CampusTypeStatus) =>
  axios.patch<{ result: CampusType }>(`${BASE_URL}/${id}/status`, { status });
