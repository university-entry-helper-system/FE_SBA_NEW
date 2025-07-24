export interface SimpleAccountResponse {
  id: string;
  fullName: string;
  avatarUrl?: string;
  email?: string;
}

export enum ConsultationStatus {
  PENDING = 'pending',
  ANSWERED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ConsultationResponse {
  id: number;
  sender: SimpleAccountResponse;
  consultant: SimpleAccountResponse;
  title: string;
  content: string;
  answer?: string;
  consultationsStatus: ConsultationStatus;
  sentAt: string;
  senderUpdatedAt?: string;
  consultantUpdatedAt?: string;
  answeredAt?: string;
  resolutionNotes?: string;
}

export interface ConsultationCreateRequest {
  consultant: string; // UUID
  title: string;
  content: string;
}

export interface ConsultationAnswerRequest {
  consultationId: number;
  answer: string;
  resolutionNotes?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface WebSocketNotification {

  type: NotificationType;
  message: string;
  data: any;
  timestamp: string;
   id?: string;
  read?: boolean;
}

export enum NotificationType {
  NEW_CONSULTATION = 'NEW_CONSULTATION',
  CONSULTATION_ANSWERED = 'CONSULTATION_ANSWERED',
  CONSULTATION_UPDATED = 'CONSULTATION_UPDATED',
  CONSULTATION_CANCELLED = 'CONSULTATION_CANCELLED',
  STATS_UPDATE = 'STATS_UPDATE'
}
export interface GroupedConsultationResponse {
  senderId: string; // UUID as string in TypeScript
  consultations: ConsultationResponse[];
}
