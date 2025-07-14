import instance from "./axios";
import type {
  SubjectCombinationCreateRequest,
  SubjectCombinationUpdateRequest,
  SubjectCombinationStatus,
} from "../types/subjectCombination";

export const getSubjectCombinations = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => instance.get("/subject-combinations", { params });

export const getSubjectCombination = (id: number) =>
  instance.get(`/subject-combinations/${id}`);

export const createSubjectCombination = (
  data: SubjectCombinationCreateRequest
) => instance.post("/subject-combinations", data);

export const updateSubjectCombination = (
  id: number,
  data: SubjectCombinationUpdateRequest
) => instance.put(`/subject-combinations/${id}`, data);

export const updateSubjectCombinationStatus = (
  id: number,
  status: SubjectCombinationStatus
) => instance.patch(`/subject-combinations/${id}/status`, { status });

export const deleteSubjectCombination = (id: number) =>
  instance.delete(`/subject-combinations/${id}`);
