export type CampusStatus = "active" | "inactive" | "deleted";

export interface CampusType {
  id: number;
  name: string;
  description?: string;
  status: CampusStatus;
}

export interface UniversityShort {
  id: number;
  universityCode: string;
  name: string;
  shortName: string;
}

export interface ProvinceShort {
  id: number;
  name: string;
  region: string;
}

export interface Campus {
  id: number;
  campusName: string;
  campusCode: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  isMainCampus: boolean;
  campusType: CampusType;
  description?: string;
  establishedYear?: number;
  areaHectares?: number;
  university: UniversityShort;
  province: ProvinceShort;
  status: CampusStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CampusCreateRequest {
  universityId: number;
  provinceId: number;
  campusName: string;
  campusCode: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  isMainCampus: boolean;
  campusTypeId: number;
  description?: string;
  establishedYear?: number;
  areaHectares?: number;
}

export type CampusUpdateRequest = Partial<CampusCreateRequest>;

export interface CampusListResponse {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: Campus[];
}
