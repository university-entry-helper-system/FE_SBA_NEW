export type ExamSubjectStatus = "ACTIVE" | "DELETED";

export interface ExamSubject {
  id: number;
  name: string;
  shortName: string;
  status: ExamSubjectStatus;
}

export interface ExamSubjectCreateRequest {
  name: string;
  shortName: string;
}

export interface ExamSubjectUpdateRequest extends ExamSubjectCreateRequest {
  status?: ExamSubjectStatus;
}

export interface ExamSubjectPaginatedResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: ExamSubject[];
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
