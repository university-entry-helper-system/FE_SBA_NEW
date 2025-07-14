export type BlockStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface SubjectCombinationForBlock {
  id: number;
  name: string;
  description: string;
  status: string;
}

export interface Block {
  id: number;
  name: string;
  description: string;
  subjectCombinations: SubjectCombinationForBlock[];
  status: BlockStatus;
}

export interface BlockCreateRequest {
  name: string;
  description: string;
  subjectCombinationIds: number[];
}

export interface BlockUpdateRequest extends BlockCreateRequest {
  status?: BlockStatus;
}

export interface BlockPaginatedResponse {
  code: number;
  message: string;
  result: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: Block[];
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
