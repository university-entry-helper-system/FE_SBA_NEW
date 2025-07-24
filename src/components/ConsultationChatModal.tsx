import React, { useState, useEffect, useRef } from 'react';
import  { 
  ConsultationResponse, 
  ConsultationCreateRequest, 
  ConsultationStatus,
  WebSocketNotification,
  NotificationType 
}  from '../types/consultation';
import { 
  createConsultation, 
  updateConsultation, 
  getUserConsultations 
} from '../api/consultation';
import {    
  initializeWebSocket, 
  getWebSocketClient, 
  ConsultationWebSocketClient 
} from '../utils/consultationSocket';
import type { ConsultantProfile } from '../types/consultant';

interface ConsultationChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultant: ConsultantProfile;
  currentUserId: string;
  userRole: string;
  authToken: string;
}

const ConsultationChatModal: React.FC<ConsultationChatModalProps> = ({
  isOpen,
  onClose,
  consultant,
  currentUserId,
  userRole,
  authToken
}) => {
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingConsultation, setPendingConsultation] = useState<ConsultationResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsClientRef = useRef<ConsultationWebSocketClient | null>(null);

  // Load consultations when modal opens
  useEffect(() => {
    if (isOpen && consultant.accountId) {
      loadConsultations();
      initializeWebSocketConnection();
    }

    return () => {
      // Don't disconnect WebSocket when modal closes, keep it for global notifications
    };
  }, [isOpen, consultant.accountId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [consultations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeWebSocketConnection = () => {
    // Use existing WebSocket connection or create new one
    let wsClient = getWebSocketClient();
    
    if (!wsClient) {
      wsClient = initializeWebSocket({
        baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
        userId: currentUserId,
        userRole: userRole,
        authToken: authToken,
        onNotification: handleWebSocketNotification,
        onConnect: () => console.log('WebSocket connected'),
        onDisconnect: () => console.log('WebSocket disconnected'),
        onError: (error) => console.error('WebSocket error:', error)
      });
    }

    wsClientRef.current = wsClient;
  };

  const handleWebSocketNotification = (notification: WebSocketNotification) => {
    switch (notification.type) {
      case NotificationType.CONSULTATION_ANSWERED:
      case NotificationType.CONSULTATION_UPDATED:
        // If the notification is for current consultant, reload consultations
        const consultationData = notification.data as ConsultationResponse;
        if (consultationData.consultant.id === consultant.accountId) {
          loadConsultations();
        }
        break;
      case NotificationType.CONSULTATION_CANCELLED:
        loadConsultations();
        break;
    }
  };

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await getUserConsultations(consultant.accountId, 0, 20);
      const consultationList = response.result.content;
      
      setConsultations(consultationList);

      // Find pending consultation
      const pending = consultationList.find(
        c => c.consultationsStatus === ConsultationStatus.PENDING
      );
      setPendingConsultation(pending || null);

    } catch (err) {
      setError('Failed to load consultations');
      console.error('Error loading consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !title.trim() || pendingConsultation) return;

    try {
      setLoading(true);
      setError('');

      const request: ConsultationCreateRequest = {
        consultant: consultant.accountId,
        title: title.trim(),
        content: newMessage.trim()
      };

      await createConsultation(request);
      
      // Clear form
      setNewMessage('');
      setTitle('');
      
      // Reload consultations
      await loadConsultations();

    } catch (err: any) {
      setError(err.message || 'Failed to send consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMessage = async () => {
    if (!newMessage.trim() || !pendingConsultation) return;

    try {
      setLoading(true);
      setError('');

      const request: ConsultationCreateRequest = {
        consultant: consultant.accountId,
        title: pendingConsultation.title,
        content: newMessage.trim()
      };

      await updateConsultation(pendingConsultation.id, request);
      
      // Clear form
      setNewMessage('');
      
      // Reload consultations
      await loadConsultations();

    } catch (err: any) {
      setError(err.message || 'Failed to update consultation');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.PENDING:
        return '#f59e0b';
      case ConsultationStatus.ANSWERED:
        return '#10b981';
      case ConsultationStatus.CANCELLED:
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.PENDING:
        return 'Đang chờ phản hồi';
      case ConsultationStatus.ANSWERED:
        return 'Đã phản hồi';
      case ConsultationStatus.CANCELLED:
        return 'Đã hủy';

      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        height: '80%',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg/800px-Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg'}
              alt={consultant.fullName}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '12px'
              }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#222' }}>
                Tư vấn với {consultant.fullName}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {consultant.specialties.map((specialty) => (
                  <span
                    key={specialty.id}
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      background: '#e2e8f0',
                      color: '#4a5568'
                    }}
                  >
                    {specialty.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          backgroundColor: '#f9fafb'
        }}>
          {loading && consultations.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              Đang tải tin nhắn...
            </div>
          )}

          {consultations.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </div>
          )}

          {consultations.map((consultation) => (
            <div key={consultation.id} style={{ marginBottom: '24px' }}>
              {/* User Message */}
              <div style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '12px 12px 4px 12px',
                marginLeft: '20%',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {consultation.title}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  {consultation.content}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {formatDateTime(consultation.sentAt)}
                  {consultation.senderUpdatedAt && (
                    <span> (đã chỉnh sửa: {formatDateTime(consultation.senderUpdatedAt)})</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div style={{
                textAlign: 'center',
                margin: '8px 0'
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  color: getStatusColor(consultation.consultationsStatus),
                  backgroundColor: `${getStatusColor(consultation.consultationsStatus)}20`,
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  {getStatusText(consultation.consultationsStatus)}
                </span>
              </div>

              {/* Consultant Answer */}
              {consultation.answer && (
                <div style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '12px 16px',
                  borderRadius: '12px 12px 12px 4px',
                  marginRight: '20%',
                  marginBottom: '8px'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    {consultation.answer}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {consultation.answeredAt && formatDateTime(consultation.answeredAt)}
                    {consultation.consultantUpdatedAt && (
                      <span> (đã chỉnh sửa: {formatDateTime(consultation.consultantUpdatedAt)})</span>
                    )}
                  </div>
                  {consultation.resolutionNotes && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: '#4b5563'
                    }}>
                      <strong>Ghi chú:</strong> {consultation.resolutionNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          {error && (
            <div style={{
              color: '#ef4444',
              fontSize: '0.9rem',
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: '#fef2f2',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}

          {pendingConsultation && (
            <div style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              marginBottom: '12px'
            }}>
              Bạn có một câu hỏi đang chờ phản hồi. Bạn có thể chỉnh sửa nội dung câu hỏi.
            </div>
          )}

          {!pendingConsultation && (
            <input
              type="text"
              placeholder="Tiêu đề câu hỏi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.9rem',
                marginBottom: '8px',
                outline: 'none'
              }}
              disabled={loading}
            />
          )}

          <textarea
            placeholder={pendingConsultation ? "Chỉnh sửa câu hỏi của bạn..." : "Nội dung câu hỏi..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.9rem',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                pendingConsultation ? handleUpdateMessage() : handleSendMessage();
              }
            }}
          />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              {pendingConsultation ? 'Nhấn Ctrl+Enter để cập nhật' : 'Nhấn Ctrl+Enter để gửi'}
            </div>
            <button
              onClick={pendingConsultation ? handleUpdateMessage : handleSendMessage}
              disabled={
                loading || 
                !newMessage.trim() || 
                (!pendingConsultation && !title.trim())
              }
              style={{
                backgroundColor: loading || !newMessage.trim() || (!pendingConsultation && !title.trim()) 
                  ? '#9ca3af' 
                  : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '0.9rem',
                cursor: loading || !newMessage.trim() || (!pendingConsultation && !title.trim()) 
                  ? 'not-allowed' 
                  : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  {pendingConsultation ? 'Đang cập nhật...' : 'Đang gửi...'}
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.1rem' }}>
                    {pendingConsultation ? '✏️' : '📤'}
                  </span>
                  {pendingConsultation ? 'Cập nhật' : 'Gửi câu hỏi'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ConsultationChatModal;