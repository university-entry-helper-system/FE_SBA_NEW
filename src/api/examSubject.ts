import instance from "./axios";
import type {
  ExamSubjectCreateRequest,
  ExamSubjectUpdateRequest,
  ExamSubjectStatus,
} from "../types/examSubject";

export const getExamSubjects = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => instance.get("/exam-subjects", { params });

export const getExamSubject = (id: number) =>
  instance.get(`/exam-subjects/${id}`);

export const createExamSubject = (data: ExamSubjectCreateRequest) =>
  instance.post("/exam-subjects", data);

export const updateExamSubject = (id: number, data: ExamSubjectUpdateRequest) =>
  instance.put(`/exam-subjects/${id}`, data);

export const updateExamSubjectStatus = (
  id: number,
  status: ExamSubjectStatus
) => instance.patch(`/exam-subjects/${id}/status`, { status });

export const deleteExamSubject = (id: number) =>
  instance.delete(`/exam-subjects/${id}`);
