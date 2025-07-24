import axios from "./axios";
import type {
    ScholarshipRequest,
    ScholarshipResponse,
    ScholarshipSearchRequest,
    ValueType,
    EligibilityType,
} from "../types/scholarshipTypes.ts";
import type {ApiResponse} from "../types/block.ts";

export const createScholarship = (data: ScholarshipRequest) =>
    axios.post<ApiResponse<ScholarshipResponse>>("/scholarships/create", data);

export const updateScholarship = (id: number, data: ScholarshipRequest) =>
    axios.put<ApiResponse<ScholarshipResponse>>(`/scholarships/${id}`, data);

export const deleteScholarship = (id: number) =>
    axios.delete<void>(`/scholarships/${id}`);

export const getScholarshipById = (id: number) =>
    axios.get<ScholarshipResponse>(`/scholarships/${id}`);

export const getAllScholarships = () =>
    axios.get<ApiResponse<ScholarshipResponse[]>>("/scholarships");

export const getScholarshipsByUniversity = (universityId: number) =>
    axios.get<ApiResponse<ScholarshipResponse[]>>(`/scholarships/by-university/${universityId}`);

export const getScholarshipsByValueType = (type: ValueType) =>
    axios.get<ApiResponse<ScholarshipResponse[]>>(`/scholarships/by-value/${type}`);

export const getScholarshipsByEligibilityType = (type: EligibilityType) =>
    axios.get<ApiResponse<ScholarshipResponse[]>>(`/scholarships/by-eligibility/${type}`);

export const searchScholarships = (data: ScholarshipSearchRequest) =>
    axios.post<ApiResponse<ScholarshipResponse[]>>("/scholarships/search", data);
