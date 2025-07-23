export type ValueType = "PERCENTAGE" | "FIXED_AMOUNT" | "ACADEMIC_YEAR";
export type EligibilityType = "GPA" | "EXAM_SCORE" | "EVALUATION";
export type ScholarshipStatus = "ACTIVE" | "EXPIRED";

export interface UniversityShort {
    id: number;
    name: string;
    shortName?: string;
    logoUrl?: string;
    website?: string;
}

export interface ScholarshipResponse {
    id: number;
    name: string;
    description: string;
    valueType: ValueType;
    valueAmount: number;
    eligibilityType: EligibilityType;
    minScore: number;
    applyLink?: string;
    applicationDeadline: string;
    status: ScholarshipStatus;
    universities: UniversityShort[];
}

export interface ScholarshipRequest {
    name: string;
    description: string;
    valueType: ValueType;
    valueAmount: number;
    eligibilityType: EligibilityType;
    minScore: number;
    applyLink?: string;
    applicationDeadline: string;
    universityIds?: number[];
}

export interface ScholarshipSearchRequest {
    name?: string;
    valueType?: ValueType;
    eligibilityType?: EligibilityType;
    status?: ScholarshipStatus;
}
export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

