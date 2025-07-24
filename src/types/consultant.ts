export type ConsultantGender = "male" | "female" | "other";

export interface ConsultantSpecialty {
  id: number;
  name: string;
  status: string; // e.g., "active"
}

export interface ConsultantProfile {
  accountId: string;
  fullName: string;
  bio: string;
  gender: ConsultantGender;
  specialties: ConsultantSpecialty[];
  avatarUrl?: string; // Optional, for future avatar support
}

export interface ConsultantProfilePaginatedResult {
  content: ConsultantProfile[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ConsultantProfileApiResponse {
  code: number;
  message: string;
  result: ConsultantProfilePaginatedResult;
} 