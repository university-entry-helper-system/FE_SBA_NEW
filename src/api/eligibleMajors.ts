import axios from "./axios";

// Interface cho Subject Combination
export interface ExamSubject {
  id: number;
  name: string;
  shortName: string;
  status: string | null;
}

export interface Block {
  id: number;
  name: string;
}

export interface SubjectCombination {
  id: number;
  name: string;
  description: string;
  examSubjects: ExamSubject[];
  status: string;
  block: Block;
}

export interface SubjectCombinationResponse {
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

// Interface cho Eligible Majors
export interface EligibleMajor {
  universityId: number;
  universityName: string;
  majorId: number;
  majorName: string;
  uniMajorName: string;
  score: number;
  year: number;
}

export interface EligibleMajorsResponse {
  code: number;
  message: string;
  result: EligibleMajor[];
}

export interface EligibleMajorsRequest {
  score: number;
  subjectCombinationId: number;
  maxGap?: number | null;
}

// API calls
export const getAllSubjectCombinations =
  async (): Promise<SubjectCombinationResponse> => {
    const response = await axios.get("/subject-combinations?page=0&size=100");
    return response.data;
  };

export const getEligibleMajors = async (
  data: EligibleMajorsRequest
): Promise<EligibleMajorsResponse> => {
  const response = await axios.post("/university-majors/eligible-majors", data);
  return response.data;
};
