export interface SubjectCombinationSummary {
  id: number;
  name: string;
}

export interface UniversityMajor {
  id:number;
  universityId: number;
  majorId: number;
  majorName: string;
  uniMajorName: string;
  quota: number;
  notes: string;
  year: number;
  admissionMethodIds: number[];
  subjectCombinationIds: number[];
  score: number;
  // Add for API response compatibility
  subjectCombinations?: SubjectCombinationSummary[];
} 
export interface UniversityMajorRequest {
  universityId: number;
  majorId: number;
  universityMajorName: string;
  quota: number;
  notes: string;
  year: number;
  admissionMethodIds: number[];
  subjectCombinationIds: number[];
  scores: number;
  // Add for API response compatibility
  subjectCombinations?: SubjectCombinationSummary[];
} 