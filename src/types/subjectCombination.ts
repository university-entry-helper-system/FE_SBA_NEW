export type SubjectCombinationStatus = "ACTIVE" | "DELETED";

export interface ExamSubject {
  id: number;
  name: string;
  shortName: string;
}

export interface SubjectCombination {
  id: number;
  name: string;
  description: string;
  examSubjects: ExamSubject[];
  status: SubjectCombinationStatus;
}

export interface SubjectCombinationCreateRequest {
  name: string;
  description: string;
  examSubjectIds: number[];
}

export interface SubjectCombinationUpdateRequest
  extends SubjectCombinationCreateRequest {
  status?: SubjectCombinationStatus;
}

export interface SubjectCombinationPaginatedResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: SubjectCombination[];
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
