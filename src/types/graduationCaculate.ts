export interface SubjectScoreByGrade {
  grade10: number | null;
  grade11: number | null;
  grade12: number | null;
}

export interface AllSubjectsScore {
  literature: SubjectScoreByGrade;
  math: SubjectScoreByGrade;
  foreignLanguage: SubjectScoreByGrade;
  nationalDefense: SubjectScoreByGrade;
  history: SubjectScoreByGrade;
  chemistry: SubjectScoreByGrade;
  biology: SubjectScoreByGrade;
  physics: SubjectScoreByGrade;
  geography: SubjectScoreByGrade;
  civicEducation: SubjectScoreByGrade;
  informatics: SubjectScoreByGrade;
  technology: SubjectScoreByGrade;
}

export interface GraduationScoreRequest {
  literatureScore: number | null;
  mathScore: number | null;
  foreignLanguageScore: number | null;
  electiveScore: number | null;
  bonusScore: number | null;
  priorityScore: number | null;
  allSubjectsScore: AllSubjectsScore;
  exemptedFromForeignLanguage: boolean;
}

export interface GraduationScoreResponse {
  totalExamScore: number;
  bonusScore: number;
  averageSchoolScore: number;
  priorityScore: number;
  finalGraduationScore: number;
  resultMessage: string;
  reason: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
