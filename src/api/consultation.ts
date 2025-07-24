// api/consultation.ts

import { 
GroupedConsultationResponse,
  ConsultationResponse, 
  ConsultationCreateRequest, 
  ConsultationAnswerRequest,
  ApiResponse, 
  PageResponse 
} from '../types/consultation';

const API_BASE_URL = 'http://localhost:8080';

// Get auth token from localStorage or your auth system
const getAuthToken = () => {
  return localStorage.getItem('accessToken') || '';
};

const createHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

// User endpoints
export const createConsultation = async (
  request: ConsultationCreateRequest
): Promise<ApiResponse<ConsultationResponse>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create consultation');
  }

  return response.json();
};

export const updateConsultation = async (
  id: number,
  request: ConsultationCreateRequest
): Promise<ApiResponse<ConsultationResponse>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/${id}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update consultation');
  }

  return response.json();
};

export const getUserConsultations = async (
  consultantId: string,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PageResponse<ConsultationResponse>>> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/consultations/user/${consultantId}?page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: createHeaders()
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user consultations');
  }

  return response.json();
};

export const searchUserConsultations = async (
  consultantId: string,
  keyword: string,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PageResponse<ConsultationResponse>>> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/consultations/user/${consultantId}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: createHeaders()
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search user consultations');
  }

  return response.json();
};

// Consultant endpoints
export const answerConsultation = async (
  request: ConsultationAnswerRequest
): Promise<ApiResponse<ConsultationResponse>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/consultant/answer`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to answer consultation');
  }

  return response.json();
};

export const updateConsultantAnswer = async (
  request: ConsultationAnswerRequest
): Promise<ApiResponse<ConsultationResponse>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/consultant/answer`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update consultation answer');
  }

  return response.json();
};

export const cancelConsultation = async (consultationId: number): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/consultant/${consultationId}`, {
    method: 'DELETE',
    headers: createHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel consultation');
  }

  return response.json();
};

export const getConsultantConsultations = async (
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PageResponse<GroupedConsultationResponse>>> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/consultations/consultant?page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: createHeaders()
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch consultant consultations');
  }

  return response.json();
};

export const searchConsultantConsultations = async (
  keyword: string,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PageResponse<ConsultationResponse>>> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/consultations/consultant/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: createHeaders()
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search consultant consultations');
  }

  return response.json();
};

// Get consultation by ID (you may need to add this endpoint to your backend)
export const getConsultationById = async (id: number): Promise<ApiResponse<ConsultationResponse>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/${id}`, {
    method: 'GET',
    headers: createHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch consultation');
  }

  return response.json();
};