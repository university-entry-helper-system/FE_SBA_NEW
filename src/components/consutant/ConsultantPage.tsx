import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ConsultationWebSocketClient } from '../../utils/consultationSocket';
import { 
  getConsultantConsultations, 
  answerConsultation, 
  updateConsultantAnswer,
  cancelConsultation 
} from '../../api/consultation';
import { 
  GroupedConsultationResponse, 
  ConsultationResponse, 
  ConsultationStatus,
  WebSocketNotification,
  NotificationType 
} from '../../types/consultation';
import NotificationPanel from '../NotificationPanel';
import { showToastNotification } from '../../utils/notification';


const ConsultantPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [groupedConsultations, setGroupedConsultations] = useState<GroupedConsultationResponse[]>([]);
  const [selectedUserConsultations, setSelectedUserConsultations] = useState<ConsultationResponse[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  const wsClientRef = useRef<ConsultationWebSocketClient | null>(null);

  // Debug: Log dependencies
  console.log('Dependencies:', {
    useAuth: !!useAuth,
    useConsultationWebSocket: !!ConsultationWebSocketClient,
    NotificationPanel: !!NotificationPanel,
  });
  // Check if user has consultant role
  useEffect(() => {
    console.log('Auth check:', { isAuthenticated, user });
    if (!isAuthenticated || !user) {
      console.log('Redirecting to login: Not authenticated or no user');
      navigate('/login');
      return;
    }
    if (user?.roleName !== 'ROLE_CONSULTANT') {
      console.log('Redirecting to login: Invalid role', user.roleName);
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // WebSocket connection
 useEffect(() => {
    if (user?.accountId && user?.roleName && isAuthenticated) {
      wsClientRef.current = new ConsultationWebSocketClient({
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
        userId: user.accountId,
        userRole: user.roleName,
        authToken: localStorage.getItem('accessToken') || '',
        onNotification: (notification) => {
          console.log('WebSocket notification (consultant):', notification);
          handleWebSocketNotification(notification);
        },
        onConnect: () => console.log('WebSocket connected (consultant)'),
        onDisconnect: () => console.log('WebSocket disconnected (consultant)'),
        onError: (err) => {
          console.error('WebSocket error (consultant):', err);
          setError('WebSocket connection failed');
        },
      });
      wsClientRef.current.connect();
    }
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
        wsClientRef.current = null;
      }
    };
  }, [user?.accountId, user?.roleName, isAuthenticated]);

 useEffect(() => {
      console.log('Loading grouped consultations...');
      loadGroupedConsultations();
    
  }, [isAuthenticated, user]);
 useEffect(() => {
    console.log('Selected consultations updated:', selectedUserConsultations);
    scrollToBottom();
  }, [selectedUserConsultations]);

// --- Add effect to always update selectedUserConsultations with latest data ---
useEffect(() => {
  if (selectedUserId && groupedConsultations.length > 0) {
    const groupedConsultation = groupedConsultations.find(gc => gc.senderId === selectedUserId);
    if (groupedConsultation) {
      setSelectedUserConsultations(groupedConsultation.consultations);
    }
  }
}, [groupedConsultations, selectedUserId]);

function handleWebSocketNotification(notification: WebSocketNotification) {
  showToastNotification(notification);

  switch (notification.type) {
    case NotificationType.NEW_CONSULTATION:
    case NotificationType.CONSULTATION_UPDATED:
    case NotificationType.CONSULTATION_ANSWERED:
    case NotificationType.CONSULTATION_CANCELLED:
      // Force refresh both grouped consultations and selected user data
      setDataRefreshTrigger(prev => prev + 1);
      break;
  }
}
// --- Fix: Use latest data after notification for selectedUserConsultations ---
useEffect(() => {
  if (dataRefreshTrigger > 0) {
    (async () => {
      const newGrouped = await loadGroupedConsultations();
      if (selectedUserId) {
        const groupedConsultation = newGrouped.find(gc => gc.senderId === selectedUserId);
        if (groupedConsultation) {
          setSelectedUserConsultations(groupedConsultation.consultations);
        }
      }
    })();
  }
}, [dataRefreshTrigger]);

 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Fix: Refactor loadGroupedConsultations to return new data ---
  const loadGroupedConsultations = async () => {
    try {
      setLoading(true);
      const response = await getConsultantConsultations(0, 100);
      const newGrouped = response.result.content || [];
      setGroupedConsultations(newGrouped);
      setError('');
      return newGrouped;
    } catch (err: any) {
      setError(err.message || 'Failed to load consultations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadUserConsultations = (userId: string, userName: string) => {
    const groupedConsultation = groupedConsultations.find(gc => gc.senderId === userId);
    if (groupedConsultation) {
      setSelectedUserConsultations(groupedConsultation.consultations);
      setSelectedUserId(userId);
      setSelectedUserName(userName);
      
      // Clear previous answer state
      setAnswerText('');
      setResolutionNotes('');
      setSelectedConsultationId(null);
    }
  };

  const handleAnswerConsultation = async (consultationId: number) => {
    if (!answerText.trim()) {
      alert('Vui lòng nhập câu trả lời');
      return;
    }

    try {
      setIsAnswering(true);
      await answerConsultation({
        consultationId,
        answer: answerText.trim(),
        resolutionNotes: resolutionNotes.trim() || undefined
      });

      // Clear form
      setAnswerText('');
      setResolutionNotes('');
      setSelectedConsultationId(null);

      // Reload data
      await loadGroupedConsultations();
      if (selectedUserId) {
        loadUserConsultations(selectedUserId, selectedUserName);
      }

      showSuccessMessage('Đã trả lời câu hỏi thành công!');
    } catch (err: any) {
      alert(err.message || 'Failed to answer consultation');
    } finally {
      setIsAnswering(false);
    }
  };

  const handleUpdateAnswer = async (consultationId: number) => {
    if (!answerText.trim()) {
      alert('Vui lòng nhập câu trả lời');
      return;
    }

    try {
      setIsUpdating(true);
      await updateConsultantAnswer({
        consultationId,
        answer: answerText.trim(),
        resolutionNotes: resolutionNotes.trim() || undefined
      });

      // Clear form
      setAnswerText('');
      setResolutionNotes('');
      setSelectedConsultationId(null);

      // Reload data
      await loadGroupedConsultations();
      if (selectedUserId) {
        loadUserConsultations(selectedUserId, selectedUserName);
      }

      showSuccessMessage('Đã cập nhật câu trả lời thành công!');
    } catch (err: any) {
      alert(err.message || 'Failed to update answer');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelConsultation = async (consultationId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy câu hỏi này?')) {
      return;
    }

    try {
      await cancelConsultation(consultationId);

      // Reload data
      await loadGroupedConsultations();
      if (selectedUserId) {
        loadUserConsultations(selectedUserId, selectedUserName);
      }

      showSuccessMessage('Đã hủy câu hỏi thành công!');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel consultation');
    }
  };

  const showSuccessMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 10001;
      animation: slideInRight 0.3s ease-out;
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.2rem;">✅</span>
        ${message}
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
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
        return 'Chờ phản hồi';
      case ConsultationStatus.ANSWERED:
        return 'Đã phản hồi';
      case ConsultationStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await logout();
      navigate('/login');
    }
  };

  const selectConsultationForAnswer = (consultation: ConsultationResponse) => {
    setSelectedConsultationId(consultation.id);
    if (consultation.answer) {
      setAnswerText(consultation.answer);
      setResolutionNotes(consultation.resolutionNotes || '');
    } else {
      setAnswerText('');
      setResolutionNotes('');
    }
  };

  

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <div style={{
        width: '320px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#1f2937' }}>
              Tư vấn viên
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Connection Status */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: wsClientRef.current ? '#10b981' : '#ef4444'
              }} />
              
              {/* Notifications */}
              {/* NotificationPanel is omitted in per-component WebSocket mode */}
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Xin chào, {user?.email}
          </div>
        </div>

        {/* User List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              Đang tải...
            </div>
          )}

          {error && (
            <div style={{ padding: '20px', color: '#ef4444', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {groupedConsultations.map((grouped) => {
            const pendingCount = grouped.consultations.filter(c => c.consultationsStatus === ConsultationStatus.PENDING).length;
            const isSelected = selectedUserId === grouped.senderId;

            return (
              <div
                key={grouped.senderId}
                onClick={() => loadUserConsultations(grouped.senderId, grouped.consultations[0].sender.fullName)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                  borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {grouped.consultations[0].sender.fullName}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#6b7280',
                      marginBottom: '6px'
                    }}>
                      {grouped.consultations.length} câu hỏi
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {formatDateTime(grouped.consultations[0].sentAt)}
                    </div>
                  </div>
                  {pendingCount > 0 && (
                    <div style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {pendingCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && groupedConsultations.length === 0 && (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#6b7280' 
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
              <div>Chưa có câu hỏi nào</div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            <span>🚪</span>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '20px',
              backgroundColor: 'white',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#1f2937' }}>
                  {selectedUserName}
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '4px' }}>
                  {selectedUserConsultations.length} câu hỏi
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedUserName('');
                  setSelectedUserConsultations([]);
                  setSelectedConsultationId(null);
                  setAnswerText('');
                  setResolutionNotes('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              backgroundColor: '#f9fafb'
            }}>
              {selectedUserConsultations.map((consultation) => (
                <div key={consultation.id} style={{ marginBottom: '32px' }}>
                  {/* User Question */}
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    color: '#222',
                    padding: '16px 20px',
                    borderRadius: '16px 16px 16px 4px',
                    marginRight: '40%',
                    marginBottom: '12px',
                    position: 'relative',
                    textAlign: 'left',
                    alignSelf: 'flex-start',
                    maxWidth: '60%',
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1rem' }}>
                      {consultation.title}
                    </div>
                    <div style={{ marginBottom: '12px', lineHeight: '1.5' }}>
                      {consultation.content}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                      {formatDateTime(consultation.sentAt)}
                      {consultation.senderUpdatedAt && (
                        <span> (chỉnh sửa: {formatDateTime(consultation.senderUpdatedAt)})</span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ textAlign: 'center', margin: '12px 0' }}>
                    <span style={{
                      fontSize: '0.85rem',
                      color: getStatusColor(consultation.consultationsStatus),
                      backgroundColor: `${getStatusColor(consultation.consultationsStatus)}20`,
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontWeight: 500
                    }}>
                      {getStatusText(consultation.consultationsStatus)}
                    </span>
                  </div>

                  {/* Answer */}
                  {consultation.answer && (
                    <div style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '16px 20px',
                      borderRadius: '16px 16px 4px 16px',
                      marginLeft: '40%',
                      marginBottom: '12px',
                      alignSelf: 'flex-end',
                      maxWidth: '60%',
                      textAlign: 'right',
                    }}>
                      <div style={{ marginBottom: '12px', lineHeight: '1.5' }}>
                        {consultation.answer}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                        {consultation.answeredAt && formatDateTime(consultation.answeredAt)}
                        {consultation.consultantUpdatedAt && (
                          <span> (chỉnh sửa: {formatDateTime(consultation.consultantUpdatedAt)})</span>
                        )}
                      </div>
                      {consultation.resolutionNotes && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          color: '#e0e7ef'
                        }}>
                          <strong>Ghi chú:</strong> {consultation.resolutionNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons for pending consultations */}
                  {consultation.consultationsStatus === ConsultationStatus.PENDING && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                      <button
                        onClick={() => selectConsultationForAnswer(consultation)}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Trả lời câu hỏi
                      </button>
                      <button
                        onClick={() => handleCancelConsultation(consultation.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  )}

                  {/* Action buttons for answered consultations */}
                  {consultation.answer && consultation.consultationsStatus !== ConsultationStatus.PENDING && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: '12px',
                      marginTop: '12px'
                    }}>
                      <button
                        onClick={() => selectConsultationForAnswer(consultation)}
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Answer Form */}
            {selectedConsultationId && (
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Câu trả lời *
                  </label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                    disabled={isAnswering || isUpdating}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Ghi chú thêm về câu trả lời..."
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                    disabled={isAnswering || isUpdating}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setSelectedConsultationId(selectedConsultationId);
                      setAnswerText('');
                      setResolutionNotes('');
                    }}
                    disabled={isAnswering || isUpdating}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      cursor: (isAnswering || isUpdating) ? 'not-allowed' : 'pointer',
                      fontWeight: 500,
                      opacity: (isAnswering || isUpdating) ? 0.6 : 1
                    }}
                  >
                    Hủy
                  </button>

                  {selectedUserConsultations.find(c => c.id === selectedConsultationId)?.answer ? (
                    <button
                      onClick={() => handleUpdateAnswer(selectedConsultationId)}
                      disabled={isUpdating || !answerText.trim()}
                      style={{
                        backgroundColor: (!answerText.trim() || isUpdating) ? '#9ca3af' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '0.9rem',
                        cursor: (!answerText.trim() || isUpdating) ? 'not-allowed' : 'pointer',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isUpdating ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <span>✏️</span>
                          Cập nhật câu trả lời
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAnswerConsultation(selectedConsultationId)}
                      disabled={isAnswering || !answerText.trim()}
                      style={{
                        backgroundColor: (!answerText.trim() || isAnswering) ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '0.9rem',
                        cursor: (!answerText.trim() || isAnswering) ? 'not-allowed' : 'pointer',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isAnswering ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <span>📤</span>
                          Gửi câu trả lời
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Welcome Screen */
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white'
          }}>
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💬</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 600 }}>
                Chào mừng đến trang tư vấn
              </h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                Chọn một người dùng từ danh sách để xem và trả lời câu hỏi của họ
              </p>
              
              {/* Statistics */}
              <div style={{ 
                marginTop: '32px',
                display: 'flex',
                justifyContent: 'center',
                gap: '24px'
              }}>
                <div style={{
                  padding: '16px',
                  background: '#f0f9ff',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: '#3b82f6',
                    marginBottom: '4px'
                  }}>
                    {groupedConsultations.length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Người dùng
                  </div>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: '#fef3c7',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: '#f59e0b',
                    marginBottom: '4px'
                  }}>
                    {groupedConsultations.reduce((total, grouped) => 
                      total + grouped.consultations.filter(c => c.consultationsStatus === ConsultationStatus.PENDING).length, 0
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Chờ phản hồi
                  </div>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: '#d1fae5',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: '#10b981',
                    marginBottom: '4px'
                  }}>
                    {groupedConsultations.reduce((total, grouped) => 
                      total + grouped.consultations.filter(c => c.consultationsStatus === ConsultationStatus.ANSWERED).length, 0
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Đã trả lời
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Spinner Animation */}
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

export default ConsultantPage;