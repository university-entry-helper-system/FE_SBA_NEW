import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ConsultationWebSocketClient } from "../../utils/consultationSocket";
import {
  getConsultantConsultations,
  answerConsultation,
  updateConsultantAnswer,
  cancelConsultation,
} from "../../api/consultation";
import {
  GroupedConsultationResponse,
  ConsultationResponse,
  ConsultationStatus,
  WebSocketNotification,
  NotificationType,
} from "../../types/consultation";
import NotificationPanel from "../NotificationPanel";
import { showToastNotification } from "../../utils/notification";
import "../../css/consultant/ConsultantPage.css";

const ConsultantPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [groupedConsultations, setGroupedConsultations] = useState<
    GroupedConsultationResponse[]
  >([]);
  const [selectedUserConsultations, setSelectedUserConsultations] = useState<
    ConsultationResponse[]
  >([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [selectedConsultationId, setSelectedConsultationId] = useState<
    number | null
  >(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  const wsClientRef = useRef<ConsultationWebSocketClient | null>(null);

  // Debug: Log dependencies
  console.log("Dependencies:", {
    useAuth: !!useAuth,
    useConsultationWebSocket: !!ConsultationWebSocketClient,
    NotificationPanel: !!NotificationPanel,
  });

  // Check if user has consultant role
  useEffect(() => {
    console.log("Auth check:", { isAuthenticated, user });
    if (!isAuthenticated || !user) {
      console.log("Redirecting to login: Not authenticated or no user");
      navigate("/login");
      return;
    }
    if (user?.roleName !== "ROLE_CONSULTANT") {
      console.log("Redirecting to login: Invalid role", user.roleName);
      navigate("/login");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // WebSocket connection
  useEffect(() => {
    if (user?.accountId && user?.roleName && isAuthenticated) {
      wsClientRef.current = new ConsultationWebSocketClient({
        baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
        userId: user.accountId,
        userRole: user.roleName,
        authToken: localStorage.getItem("accessToken") || "",
        onNotification: (notification) => {
          console.log("WebSocket notification (consultant):", notification);
          handleWebSocketNotification(notification);
        },
        onConnect: () => console.log("WebSocket connected (consultant)"),
        onDisconnect: () => console.log("WebSocket disconnected (consultant)"),
        onError: (err) => {
          console.error("WebSocket error (consultant):", err);
          setError("WebSocket connection failed");
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
    console.log("Loading grouped consultations...");
    loadGroupedConsultations();
  }, [isAuthenticated, user]);

  useEffect(() => {
    console.log("Selected consultations updated:", selectedUserConsultations);
    scrollToBottom();
  }, [selectedUserConsultations]);

  // --- Add effect to always update selectedUserConsultations with latest data ---
  useEffect(() => {
    if (selectedUserId && groupedConsultations.length > 0) {
      const groupedConsultation = groupedConsultations.find(
        (gc) => gc.senderId === selectedUserId
      );
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
        setDataRefreshTrigger((prev) => prev + 1);
        break;
    }
  }

  // --- Fix: Use latest data after notification for selectedUserConsultations ---
  useEffect(() => {
    if (dataRefreshTrigger > 0) {
      (async () => {
        const newGrouped = await loadGroupedConsultations();
        if (selectedUserId) {
          const groupedConsultation = newGrouped.find(
            (gc) => gc.senderId === selectedUserId
          );
          if (groupedConsultation) {
            setSelectedUserConsultations(groupedConsultation.consultations);
          }
        }
      })();
    }
  }, [dataRefreshTrigger]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Fix: Refactor loadGroupedConsultations to return new data ---
  const loadGroupedConsultations = async () => {
    try {
      setLoading(true);
      const response = await getConsultantConsultations(0, 100);
      let newGrouped = response.result.content || [];
      // Sort by most recent consultation (by sentAt)
      newGrouped = newGrouped.sort((a, b) => {
        const aDate = a.consultations[0]?.sentAt
          ? new Date(a.consultations[0].sentAt).getTime()
          : 0;
        const bDate = b.consultations[0]?.sentAt
          ? new Date(b.consultations[0].sentAt).getTime()
          : 0;
        return bDate - aDate;
      });
      setGroupedConsultations(newGrouped);
      setError("");
      return newGrouped;
    } catch (err: any) {
      setError(err.message || "Failed to load consultations");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadUserConsultations = (userId: string, userName: string) => {
    const groupedConsultation = groupedConsultations.find(
      (gc) => gc.senderId === userId
    );
    if (groupedConsultation) {
      setSelectedUserConsultations(groupedConsultation.consultations);
      setSelectedUserId(userId);
      setSelectedUserName(userName);

      // Clear previous answer state
      setAnswerText("");
      setResolutionNotes("");
      setSelectedConsultationId(null);
    }
  };

  const handleAnswerConsultation = async (consultationId: number) => {
    if (!answerText.trim()) {
      alert("Vui lòng nhập câu trả lời");
      return;
    }

    try {
      setIsAnswering(true);
      await answerConsultation({
        consultationId,
        answer: answerText.trim(),
        resolutionNotes: resolutionNotes.trim() || undefined,
      });

      // Clear form
      setAnswerText("");
      setResolutionNotes("");
      setSelectedConsultationId(null);

      // Reload data
      await loadGroupedConsultations();
      if (selectedUserId) {
        loadUserConsultations(selectedUserId, selectedUserName);
      }

      showSuccessMessage("Đã trả lời câu hỏi thành công!");
    } catch (err: any) {
      alert(err.message || "Failed to answer consultation");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleUpdateAnswer = async (consultationId: number) => {
    if (!answerText.trim()) {
      alert("Vui lòng nhập câu trả lời");
      return;
    }

    try {
      setIsUpdating(true);
      await updateConsultantAnswer({
        consultationId,
        answer: answerText.trim(),
        resolutionNotes: resolutionNotes.trim() || undefined,
      });

      // Clear form
      setAnswerText("");
      setResolutionNotes("");
      setSelectedConsultationId(null);

      // Reload data
      await loadGroupedConsultations();
      if (selectedUserId) {
        loadUserConsultations(selectedUserId, selectedUserName);
      }

      showSuccessMessage("Đã cập nhật câu trả lời thành công!");
    } catch (err: any) {
      alert(err.message || "Failed to update answer");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelConsultation = async (consultationId: number) => {
    if (!confirm("Bạn có chắc chắn muốn hủy câu hỏi này?")) {
      return;
    }

    try {
      await cancelConsultation(consultationId);

      // Reload data
      await loadGroupedConsultations();
      if (selectedUserId) {
        loadUserConsultations(selectedUserId, selectedUserName);
      }

      showSuccessMessage("Đã hủy câu hỏi thành công!");
    } catch (err: any) {
      alert(err.message || "Failed to cancel consultation");
    }
  };

  const showSuccessMessage = (message: string) => {
    const toast = document.createElement("div");
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
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.PENDING:
        return "Chờ phản hồi";
      case ConsultationStatus.ANSWERED:
        return "Đã phản hồi";
      case ConsultationStatus.CANCELLED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusClass = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.PENDING:
        return "status-pending";
      case ConsultationStatus.ANSWERED:
        return "status-answered";
      case ConsultationStatus.CANCELLED:
        return "status-cancelled";
      default:
        return "";
    }
  };

  const handleLogout = async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await logout();
      navigate("/login");
    }
  };

  const selectConsultationForAnswer = (consultation: ConsultationResponse) => {
    setSelectedConsultationId(consultation.id);
    if (consultation.answer) {
      setAnswerText(consultation.answer);
      setResolutionNotes(consultation.resolutionNotes || "");
    } else {
      setAnswerText("");
      setResolutionNotes("");
    }
  };

  return (
    <div className="consultant-page">
      {/* Sidebar */}
      <div className="consultant-sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <h2 className="sidebar-title">Tư vấn viên</h2>
            <div className="connection-indicator">
              {/* Connection Status */}
              <div
                className={`connection-dot ${
                  wsClientRef.current ? "" : "disconnected"
                }`}
              />
              {/* Notifications */}
              {/* NotificationPanel is omitted in per-component WebSocket mode */}
            </div>
          </div>
          <div className="sidebar-subtitle">Xin chào, {user?.email}</div>
        </div>

        {/* User List */}
        <div className="user-list">
          {loading && <div className="loading-state">Đang tải...</div>}

          {error && <div className="error-state">{error}</div>}

          {groupedConsultations.map((grouped) => {
            const pendingCount = grouped.consultations.filter(
              (c) => c.consultationsStatus === ConsultationStatus.PENDING
            ).length;
            const isSelected = selectedUserId === grouped.senderId;

            return (
              <div
                key={grouped.senderId}
                onClick={() =>
                  loadUserConsultations(
                    grouped.senderId,
                    grouped.consultations[0].sender.fullName
                  )
                }
                className={`user-item ${isSelected ? "selected" : ""}`}
              >
                <div className="user-info">
                  <div className="user-details">
                    <div className="user-name">
                      {grouped.consultations[0].sender.fullName}
                    </div>
                    <div className="user-questions-count">
                      {grouped.consultations.length} câu hỏi
                    </div>
                    <div className="user-timestamp">
                      {formatDateTime(grouped.consultations[0].sentAt)}
                    </div>
                  </div>
                  {pendingCount > 0 && (
                    <div className="pending-badge">{pendingCount}</div>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && groupedConsultations.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-text">Chưa có câu hỏi nào</div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="logout-section">
          <button onClick={handleLogout} className="logout-button">
            <span>🚪</span>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <h3>{selectedUserName}</h3>
                <div className="chat-header-subtitle">
                  {selectedUserConsultations.length} câu hỏi
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedUserName("");
                  setSelectedUserConsultations([]);
                  setSelectedConsultationId(null);
                  setAnswerText("");
                  setResolutionNotes("");
                }}
                className="close-chat-button"
              >
                ×
              </button>
            </div>

            {/* Messages Area */}
            <div className="messages-area">
              {selectedUserConsultations.map((consultation) => (
                <div key={consultation.id} className="conversation-item">
                  {/* User Question */}
                  <div className="user-message">
                    <div className="message-title">{consultation.title}</div>
                    <div className="message-content">
                      {consultation.content}
                    </div>
                    <div className="message-timestamp">
                      {formatDateTime(consultation.sentAt)}
                      {consultation.senderUpdatedAt && (
                        <span>
                          {" "}
                          (chỉnh sửa:{" "}
                          {formatDateTime(consultation.senderUpdatedAt)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="status-container">
                    <span
                      className={`status-badge ${getStatusClass(
                        consultation.consultationsStatus
                      )}`}
                    >
                      {getStatusText(consultation.consultationsStatus)}
                    </span>
                  </div>

                  {/* Answer */}
                  {consultation.answer && (
                    <div className="consultant-message">
                      <div className="message-content">
                        {consultation.answer}
                      </div>
                      <div className="message-timestamp">
                        {consultation.answeredAt &&
                          formatDateTime(consultation.answeredAt)}
                        {consultation.consultantUpdatedAt && (
                          <span>
                            {" "}
                            (chỉnh sửa:{" "}
                            {formatDateTime(consultation.consultantUpdatedAt)})
                          </span>
                        )}
                      </div>
                      {consultation.resolutionNotes && (
                        <div className="resolution-notes">
                          <strong>Ghi chú:</strong>{" "}
                          {consultation.resolutionNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons for pending consultations */}
                  {consultation.consultationsStatus ===
                    ConsultationStatus.PENDING && (
                    <div className="action-buttons">
                      <button
                        onClick={() =>
                          selectConsultationForAnswer(consultation)
                        }
                        className="action-button primary"
                      >
                        Trả lời câu hỏi
                      </button>
                      <button
                        onClick={() =>
                          handleCancelConsultation(consultation.id)
                        }
                        className="action-button danger"
                      >
                        Hủy
                      </button>
                    </div>
                  )}

                  {/* Action buttons for answered consultations */}
                  {consultation.answer &&
                    consultation.consultationsStatus !==
                      ConsultationStatus.PENDING && (
                      <div className="action-buttons">
                        <button
                          onClick={() =>
                            selectConsultationForAnswer(consultation)
                          }
                          className="action-button warning"
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
              <div className="answer-form">
                <div className="form-group">
                  <label className="form-label">Câu trả lời *</label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="form-textarea"
                    style={{ minHeight: "100px" }}
                    disabled={isAnswering || isUpdating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú (tùy chọn)</label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Ghi chú thêm về câu trả lời..."
                    className="form-textarea"
                    style={{ minHeight: "60px" }}
                    disabled={isAnswering || isUpdating}
                  />
                </div>

                <div className="form-actions">
                  <button
                    onClick={() => {
                      setSelectedConsultationId(null);
                      setAnswerText("");
                      setResolutionNotes("");
                    }}
                    disabled={isAnswering || isUpdating}
                    className="form-button secondary"
                  >
                    Hủy
                  </button>

                  {selectedUserConsultations.find(
                    (c) => c.id === selectedConsultationId
                  )?.answer ? (
                    <button
                      onClick={() => handleUpdateAnswer(selectedConsultationId)}
                      disabled={isUpdating || !answerText.trim()}
                      className="form-button warning"
                    >
                      {isUpdating ? (
                        <>
                          <div className="loading-spinner" />
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
                      onClick={() =>
                        handleAnswerConsultation(selectedConsultationId)
                      }
                      disabled={isAnswering || !answerText.trim()}
                      className="form-button primary"
                    >
                      {isAnswering ? (
                        <>
                          <div className="loading-spinner" />
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
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon">💬</div>
              <h3 className="welcome-title">Chào mừng đến trang tư vấn</h3>
              <p className="welcome-description">
                Chọn một người dùng từ danh sách để xem và trả lời câu hỏi của
                họ
              </p>

              {/* Statistics */}
              <div className="stats-container">
                <div className="stat-card users">
                  <div className="stat-number users">
                    {groupedConsultations.length}
                  </div>
                  <div className="stat-label">Người dùng</div>
                </div>

                <div className="stat-card pending">
                  <div className="stat-number pending">
                    {groupedConsultations.reduce(
                      (total, grouped) =>
                        total +
                        grouped.consultations.filter(
                          (c) =>
                            c.consultationsStatus === ConsultationStatus.PENDING
                        ).length,
                      0
                    )}
                  </div>
                  <div className="stat-label">Chờ phản hồi</div>
                </div>

                <div className="stat-card answered">
                  <div className="stat-number answered">
                    {groupedConsultations.reduce(
                      (total, grouped) =>
                        total +
                        grouped.consultations.filter(
                          (c) =>
                            c.consultationsStatus ===
                            ConsultationStatus.ANSWERED
                        ).length,
                      0
                    )}
                  </div>
                  <div className="stat-label">Đã trả lời</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantPage;
