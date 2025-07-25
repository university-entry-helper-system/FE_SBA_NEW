// userProfile.ts
export type Gender = "MALE" | "FEMALE";
export type ImageType = "CCCD1" | "CCCD2" | "DGNL" | "THPT" | "HOCBA11" | "HOCBA12";
export type UserProfile = {
    id: number;
    profileCode: string;
    fullName: string;
    dateOfBirth: string;
    idCard: string;
    email: string;
    phone: string;
    gender: Gender;
    accountId: number;
    createdAt: string;
    updatedAt: string;
};

export type UserProfileCreateRequest = {
    fullName: string;
    dateOfBirth: string;
    idCard: string;
    email: string;
    gender: Gender;
    phone: string;
    accountId: string;
};

export type UserProfileUpdateRequest = {
    fullName?: string;
    dateOfBirth?: string;
    idCard?: string;
    email?: string;
    gender: Gender;
    phone?: string;
    accountId?: number;
};

export type UserProfileImage = {
    id: number;
    userProfileId: number;
    imageType: ImageType;
    imageName: string;
    imageUrl: string;

};

export type UserProfileImageCreateRequest = {
    imageType: string;
    imageFile: File;
};
export type GetUserProfileImageRequest = {
    userProfileId: number;
    imageType : ImageType;
}
// API response types
export type ApiResponse<T> = {
    success: boolean;
    message: string;
    result: T;
};

// Paginated response for UserProfiles
export type UserProfilePaginatedResponse = {
    content: UserProfile[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

// Paginated response for UserProfileImages
export type UserProfileImagePaginatedResponse = {
    content: UserProfileImage[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

