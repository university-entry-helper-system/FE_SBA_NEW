import instance from "./axios";
import type { GraduationScoreRequest, ApiResponse, GraduationScoreResponse } from "../types/graduationCaculate";

export const calculateGraduationScore = (data: GraduationScoreRequest) =>
  instance.post<ApiResponse<GraduationScoreResponse>>(
    "/graduation-score/calculate",
    data
  );
