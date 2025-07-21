import axios from "./axios";
import type { UniversityAdmissionMethod } from "../types/universityAdmissionMethod";

const BASE_URL = "/university-admission-methods";

export const getUniversityAdmissionMethod = (id: number) =>
  axios.get(`${BASE_URL}/${id}`);

export const updateUniversityAdmissionMethod = (id: number, data: UniversityAdmissionMethod) =>
  axios.put(`${BASE_URL}/${id}`, data);

export const deleteUniversityAdmissionMethod = (id: number) =>
  axios.delete(`${BASE_URL}/${id}`);

export const getAllUniversityAdmissionMethods = (params?: { universityId?: number; page?: number; size?: number }) =>
  axios.get(BASE_URL, { params });

export const createUniversityAdmissionMethod = (data: UniversityAdmissionMethod) =>
  axios.post(BASE_URL, data); 