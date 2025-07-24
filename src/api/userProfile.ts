import axios from "./axios";
import type {
    UserProfile,
    UserProfileCreateRequest,
    UserProfileUpdateRequest,
    UserProfileImage,
    UserProfileImageCreateRequest,
    ApiResponse,
    GetUserProfileImageRequest,
} from "../types/userProfile";

const BASE_URL = "/user-profile";
const IMAGE_URL = "/user-profile-image";

// Lấy danh sách UserProfiles (có tìm kiếm, phân trang, sắp xếp)
export const getUserProfiles = (params?: {
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
}) => axios.get<ApiResponse<UserProfile[]>>(BASE_URL, { params });

// Lấy chi tiết UserProfile theo ID
export const getUserProfileDetail = (id: string) =>
    axios.post<ApiResponse<UserProfile>>(`${BASE_URL}/get`, { id });

export const getUserProfileDetailById = (userProfileId: number) =>
    axios.post<ApiResponse<UserProfile>>(`${BASE_URL}/${userProfileId}`);

// Tạo UserProfile mới
export const createUserProfile = (data: UserProfileCreateRequest) =>
    axios.post<ApiResponse<UserProfile>>(`${BASE_URL}/create`, data);

// Cập nhật UserProfile
export const updateUserProfile = (id: number, data: UserProfileUpdateRequest) =>
    axios.put<ApiResponse<UserProfile>>(`${BASE_URL}/${id}`, data);

// Xóa UserProfile
export const deleteUserProfile = (id: number) =>
    axios.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);

// Lấy danh sách UserProfile Images
// export const getUserProfileImages = (userProfileId: number, params?: {
//     page?: number;
//     size?: number;
// }) => axios.get<ApiResponse<UserProfileImage[]>>(`${IMAGE_URL}/${userProfileId}`, { params });

// Lấy chi tiết UserProfile Image theo ID
export const getUserProfileImageDetail = (id: number) =>
    axios.get<ApiResponse<UserProfileImage>>(`${IMAGE_URL}/${id}`);

// Tạo mới UserProfile Image
export const createUserProfileImage = (userProfileId: number, data: UserProfileImageCreateRequest) =>
    axios.post<ApiResponse<UserProfileImage>>(`${IMAGE_URL}/${userProfileId}`, data);

// Cập nhật UserProfile Image
export const updateUserProfileImage = (id: number, data: UserProfileImageCreateRequest) =>
    axios.put<ApiResponse<UserProfileImage>>(`${IMAGE_URL}/${id}`, data);

// Xóa UserProfile Image
export const deleteUserProfileImage = (id: number) =>
    axios.delete<ApiResponse<null>>(`${IMAGE_URL}/${id}`);
export const getUserProfileImageByType = (data: GetUserProfileImageRequest) =>
    axios.post<ApiResponse<UserProfileImage>>(`${IMAGE_URL}`, data);