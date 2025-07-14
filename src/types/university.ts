export interface Province {
  id: number;
  name: string;
  description: string;
  region: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface University {
  id: number;
  categoryId: number;
  category: Category;
  admissionMethodIds: number[];
  name: string;
  shortName: string;
  logoUrl: string;
  foundingYear: number;
  province: Province;
  address: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UniversityListItem {
  id: number;
  categoryId: number;
  admissionMethodIds: number[];
  name: string;
  shortName: string;
  logoUrl: string;
  foundingYear: number;
  province: Province;
  address: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UniversityListResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: UniversityListItem[];
  };
}

export interface UniversityDetailResponse {
  code: number;
  message: string;
  result: University;
}

export interface UniversityCreateRequest {
  categoryId: number;
  name: string;
  shortName: string;
  logoUrl: string;
  foundingYear: number;
  provinceId: number;
  type: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  admissionMethodIds: number[];
}

export interface UniversityStatusUpdateRequest {
  status: string;
}
