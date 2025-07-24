import React, { useState, useEffect, useRef } from "react";
import {
  ConsultationResponse,
  ConsultationCreateRequest,
  ConsultationStatus,
  WebSocketNotification,
} from "../types/consultation";
import {
  createConsultation,
  updateConsultation,
  getUserConsultations,
} from "../api/consultation";
import {
  initializeWebSocket,
  getWebSocketClient,
  ConsultationWebSocketClient,
} from "../utils/consultationSocket";
import type { ConsultantProfile } from "../types/consultant";
import { showToastNotification } from "../utils/notification";
import "../css/ConsultationChatModal.css";

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
  authToken,
}) => {
  const [consultations, setConsultations] = useState<ConsultationResponse[]>(
    []
  );
  const [newMessage, setNewMessage] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingConsultation, setPendingConsultation] =
    useState<ConsultationResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsClientRef = useRef<ConsultationWebSocketClient | null>(null);

  // Load consultations when modal opens
  useEffect(() => {
    if (isOpen && consultant.accountId) {
      // Clear existing data first to show loading state
      setConsultations([]);
      setPendingConsultation(null);
      setError("");

      // Always load fresh data when modal opens
      loadConsultations();
      // Create a new WebSocket client for this modal
      wsClientRef.current = new ConsultationWebSocketClient({
        baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
        userId: currentUserId,
        userRole: userRole,
        authToken: authToken,
        onNotification: handleWebSocketNotification,
        onConnect: () => console.log("WebSocket connected (modal)"),
        onDisconnect: () => console.log("WebSocket disconnected (modal)"),
        onError: (err) => console.error("WebSocket error (modal):", err),
      });
      wsClientRef.current.connect();
    }
    // Disconnect WebSocket when modal closes or component unmounts
    if (!isOpen && wsClientRef.current) {
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
    }
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
        wsClientRef.current = null;
      }
    };
  }, [isOpen, consultant.accountId, currentUserId, userRole, authToken]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [consultations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Make the notification handler async to ensure data reload is awaited
  const handleWebSocketNotification = async (
    notification: WebSocketNotification
  ) => {
    try {
      console.log("handleWebSocketNotification called");
      showToastNotification(notification);
      console.log("Received notification:", notification);
      console.log(
        "Notification type (raw):",
        notification.type,
        typeof notification.type
      );
      console.log("Type as JSON:", JSON.stringify(notification.type));

      switch (
        notification.type &&
        notification.type.toString().trim().toUpperCase()
      ) {
        case "CONSULTATION_ANSWERED":
        case "CONSULTATION_UPDATED":
        case "CONSULTATION_CANCELLED":
        case "NEW_CONSULTATION":
          console.log("Triggering loadConsultations due to notification");
          await loadConsultations();
          console.log("loadConsultations finished");
          break;
        default:
          console.log("Notification type did not match any case");
          break;
      }

      if (
        notification.type &&
        notification.type.toString().toUpperCase().includes("CONSULTATION")
      ) {
        console.log(
          "Fallback: type contains CONSULTATION, triggering loadConsultations"
        );
        await loadConsultations();
      }
    } catch (err) {
      console.error("Error in handleWebSocketNotification:", err);
    }
  };

  const loadConsultations = async () => {
    console.log("loadConsultations called");
    try {
      setLoading(true);
      setError("");
      // Add cache busting param to avoid stale data
      const response = await getUserConsultations(consultant.accountId, 0, 100);
      console.log("Consultations API response:", response);
      const consultationList = response.result.content;
      setConsultations([...consultationList]);
      console.log("Updated consultations state:", consultationList);
      const pending = consultationList.find(
        (c) => c.consultationsStatus === ConsultationStatus.PENDING
      );
      setPendingConsultation(pending ? { ...pending } : null);
    } catch (err) {
      setError("Failed to load consultations");
      console.error("Error loading consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !title.trim() || pendingConsultation) return;

    try {
      setLoading(true);
      setError("");

      const request: ConsultationCreateRequest = {
        consultant: consultant.accountId,
        title: title.trim(),
        content: newMessage.trim(),
      };

      await createConsultation(request);
      // Clear form
      setNewMessage("");
      setTitle("");
      // Immediately reload data after sending
      await loadConsultations();
    } catch (err: any) {
      setError(err.message || "Failed to send consultation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMessage = async () => {
    if (!newMessage.trim() || !pendingConsultation) return;

    try {
      setLoading(true);
      setError("");

      const request: ConsultationCreateRequest = {
        consultant: consultant.accountId,
        title: pendingConsultation.title,
        content: newMessage.trim(),
      };

      await updateConsultation(pendingConsultation.id, request);
      // Clear form
      setNewMessage("");
      // Immediately reload data after updating
      await loadConsultations();
    } catch (err: any) {
      setError(err.message || "Failed to update consultation");
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.PENDING:
        return "#f59e0b";
      case ConsultationStatus.ANSWERED:
        return "#10b981";
      case ConsultationStatus.CANCELLED:
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.PENDING:
        return "Đang chờ phản hồi";
      case ConsultationStatus.ANSWERED:
        return "Đã phản hồi";
      case ConsultationStatus.CANCELLED:
        return "Đã hủy";

      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal-container">
        {/* Header */}
        <div className="chat-modal-header">
          <div className="chat-modal-avatar">
            <img
              src={
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg/800px-Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg"
              }
              alt={consultant.fullName}
            />
            <div>
              <h2 className="chat-modal-title">
                Tư vấn với {consultant.fullName}
              </h2>
              <div className="chat-modal-specialties">
                {consultant.specialties.map((specialty) => (
                  <span key={specialty.id} className="chat-modal-specialty">
                    {specialty.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="chat-modal-btn-close">
            ×
          </button>
        </div>

        {/* Messages Area */}
        <div className="chat-modal-messages">
          {loading && consultations.length === 0 && (
            <div className="chat-modal-loading-message">
              Đang tải tin nhắn...
            </div>
          )}

          {consultations.length === 0 && !loading && (
            <div className="chat-modal-no-messages-message">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </div>
          )}

          {consultations.map((consultation) => (
            <div key={consultation.id} className="chat-modal-message-container">
              {/* User Message */}
              <div className="chat-modal-message-user">
                <div className="chat-modal-message-title">
                  {consultation.title}
                </div>
                <div className="chat-modal-message-content">
                  {consultation.content}
                </div>
                <div className="chat-modal-message-timestamp">
                  {formatDateTime(consultation.sentAt)}
                  {consultation.senderUpdatedAt && (
                    <span>
                      {" "}
                      (đã chỉnh sửa:{" "}
                      {formatDateTime(consultation.senderUpdatedAt)})
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="chat-modal-status-container">
                <span
                  className="chat-modal-status"
                  style={{
                    backgroundColor: `${getStatusColor(
                      consultation.consultationsStatus
                    )}20`,
                  }}
                >
                  {getStatusText(consultation.consultationsStatus)}
                </span>
              </div>

              {/* Consultant Answer */}
              {consultation.answer && (
                <div className="chat-modal-message-consultant">
                  <div className="chat-modal-message-content">
                    {consultation.answer}
                  </div>
                  <div className="chat-modal-message-timestamp">
                    {consultation.answeredAt &&
                      formatDateTime(consultation.answeredAt)}
                    {consultation.consultantUpdatedAt && (
                      <span>
                        {" "}
                        (đã chỉnh sửa:{" "}
                        {formatDateTime(consultation.consultantUpdatedAt)})
                      </span>
                    )}
                  </div>
                  {consultation.resolutionNotes && (
                    <div className="chat-modal-resolution-notes">
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
        <div className="chat-modal-input-area">
          {error && <div className="chat-modal-error">{error}</div>}

          {pendingConsultation && (
            <div className="chat-modal-pending-alert">
              Bạn có một câu hỏi đang chờ phản hồi. Bạn có thể chỉnh sửa nội
              dung câu hỏi.
            </div>
          )}

          {!pendingConsultation && (
            <input
              type="text"
              placeholder="Tiêu đề câu hỏi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="chat-modal-title-input"
              disabled={loading}
            />
          )}

          <textarea
            placeholder={
              pendingConsultation
                ? "Chỉnh sửa câu hỏi của bạn..."
                : "Nội dung câu hỏi..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="chat-modal-textarea"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                if (pendingConsultation) {
                  handleUpdateMessage();
                } else {
                  handleSendMessage();
                }
              }
            }}
          />

          <div className="chat-modal-input-footer">
            <div className="chat-modal-input-hint">
              {pendingConsultation
                ? "Nhấn Ctrl+Enter để cập nhật"
                : "Nhấn Ctrl+Enter để gửi"}
            </div>
            <button
              onClick={
                pendingConsultation ? handleUpdateMessage : handleSendMessage
              }
              disabled={
                loading ||
                !newMessage.trim() ||
                (!pendingConsultation && !title.trim())
              }
              className="chat-modal-btn"
            >
              {loading ? (
                <div className="chat-modal-spinner" />
              ) : (
                <>
                  <span className="chat-modal-btn-icon">
                    {pendingConsultation ? "✏️" : "📤"}
                  </span>
                  {pendingConsultation ? "Cập nhật" : "Gửi câu hỏi"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationChatModal;
