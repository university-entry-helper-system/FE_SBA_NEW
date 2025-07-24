import axios from "./axios";
import type { ConsultantProfileApiResponse } from "../types/consultant";

// Fetch consultant profiles with pagination
export const getConsultantProfiles = (params?: { page?: number; size?: number }) =>
axios.get<ConsultantProfileApiResponse>("/consultant-profiles", { params });
