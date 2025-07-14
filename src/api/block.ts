import instance from "./axios";
import type {
  BlockCreateRequest,
  BlockUpdateRequest,
  BlockStatus,
} from "../types/block";

export const getBlocks = (params: {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => instance.get("/blocks", { params });

export const getBlock = (id: number) => instance.get(`/blocks/${id}`);

export const createBlock = (data: BlockCreateRequest) =>
  instance.post("/blocks", data);

export const updateBlock = (id: number, data: BlockUpdateRequest) =>
  instance.put(`/blocks/${id}`, data);

export const updateBlockStatus = (id: number, status: BlockStatus) =>
  instance.patch(`/blocks/${id}/status`, { status });

export const deleteBlock = (id: number) => instance.delete(`/blocks/${id}`);
