import React, { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://localhost:8081/ws/chat";
const HISTORY_API = "http://localhost:8081/api/chatbot/history/";
const SESSION_API = "http://localhost:8081/api/chatbot/session";

function generateSessionId() {
  return (
    "chat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10)
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const [error, setError] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Khởi tạo session khi component mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage, open]);

  // Xử lý khi có sessionId (load history ngay)
  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  // Xử lý khi mở/đóng chatbox
  useEffect(() => {
    if (open && sessionId) {
      connectWebSocket();
    } else if (!open) {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [open, sessionId]);

  // Xử lý streaming message
  useEffect(() => {
    if (!isStreaming || !streamingMessage) return;

    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {
        // Cập nhật message cuối nếu đang streaming
        return [
          ...prevMessages.slice(0, -1),
          { role: "assistant", content: streamingMessage },
        ];
      } else {
        // Thêm message mới nếu message cuối là user
        return [
          ...prevMessages,
          { role: "assistant", content: streamingMessage },
        ];
      }
    });
  }, [streamingMessage, isStreaming]);

  // Khi kết thúc streaming (assistant trả lời xong), tự động refresh kết nối
  useEffect(() => {
    if (!isStreaming && streamingMessage) {
      // Đảm bảo chỉ refresh khi vừa kết thúc một câu trả lời
      refreshConnection();
    }
    // eslint-disable-next-line
  }, [isStreaming, streamingMessage]);

  // Khởi tạo session
  const initializeSession = async () => {
    try {
      let sid = localStorage.getItem("chatbotSessionId");
      console.log("Current session from localStorage:", sid);

      if (!sid) {
        console.log("No existing session, creating new one...");
        // Tạo session mới qua API
        const response = await fetch(SESSION_API, { method: "POST" });
        if (response.ok) {
          const data = await response.json();
          sid = data.sessionId;
          console.log("New session created via API:", sid);
        } else {
          // Fallback: tạo session ID local nếu API fail
          sid = generateSessionId();
          console.log("API failed, generated local session:", sid);
        }
        localStorage.setItem("chatbotSessionId", sid);
      } else {
        console.log("Using existing session:", sid);
      }

      setSessionId(sid);
    } catch (error) {
      console.error("Lỗi khởi tạo session:", error);
      // Fallback: tạo session ID local
      const sid = generateSessionId();
      localStorage.setItem("chatbotSessionId", sid);
      setSessionId(sid);
      console.log("Error occurred, generated fallback session:", sid);
    }
  };

  // Load lịch sử chat
  const loadChatHistory = async () => {
    if (!sessionId) return;

    console.log("Loading chat history for session:", sessionId);

    try {
      const response = await fetch(HISTORY_API + sessionId);
      console.log("History API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("History data received:", data);
        setMessages(Array.isArray(data) ? data : []);
      } else {
        console.log("History API failed, starting with empty messages");
        setMessages([]);
      }
    } catch (error) {
      console.error("Lỗi load lịch sử:", error);
      setMessages([]);
    }
  };

  // Kết nối WebSocket
  const connectWebSocket = useCallback(() => {
    if (!sessionId || wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");
    setError("");

    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("[WebSocket] onopen, sessionId:", sessionId);
      socket.send(sessionId);
      setWs(socket);
      setConnectionStatus("connected");
      reconnectAttemptsRef.current = 0;
      console.log("[WebSocket] readyState after open:", socket.readyState);
    };

    socket.onmessage = (event) => {
      const chunk = event.data;
      console.log(
        "[WebSocket] onmessage, chunk:",
        chunk,
        "sessionId:",
        sessionId
      );
      // Nếu là chunk đầu tiên, ẩn typing indicator và bắt đầu streaming
      if (!streamingMessage) {
        setShowTypingIndicator(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
      setStreamingMessage((prev) => prev + chunk);
      setIsStreaming(true);
    };

    socket.onclose = (event) => {
      console.log(
        "[WebSocket] onclose:",
        event.code,
        event.reason,
        "readyState:",
        socket.readyState
      );
      setWs(null);
      setConnectionStatus("disconnected");
      // Kết thúc streaming khi socket đóng
      if (isStreaming) {
        setIsStreaming(false);
        setStreamingMessage("");
      }
      // Reset typing indicator
      setShowTypingIndicator(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      // Auto reconnect nếu không phải đóng có chủ ý
      if (
        open &&
        event.code !== 1000 &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          30000
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket();
        }, delay);
      }
    };

    socket.onerror = (error) => {
      console.error("[WebSocket] onerror:", error);
      setError("Lỗi kết nối WebSocket");
    };
  }, [sessionId, open, isStreaming, streamingMessage]);

  // Ngắt kết nối WebSocket
  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "User closed chatbox");
      wsRef.current = null;
    }

    setWs(null);
    setConnectionStatus("disconnected");
    setIsStreaming(false);
    setStreamingMessage("");
    setShowTypingIndicator(false);
  };

  // Gửi tin nhắn
  const handleSend = () => {
    if (
      !input.trim() ||
      !ws ||
      ws.readyState !== WebSocket.OPEN ||
      isStreaming
    ) {
      console.log(
        "[handleSend] Blocked: input=",
        input,
        "ws=",
        ws,
        "readyState=",
        ws?.readyState,
        "isStreaming=",
        isStreaming
      );
      return;
    }

    // Thêm tin nhắn user vào lịch sử
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);

    // Hiển thị typing indicator trong 3 giây
    setShowTypingIndicator(true);
    typingTimeoutRef.current = setTimeout(() => {
      setShowTypingIndicator(false);
    }, 3000);

    // Gửi qua WebSocket
    console.log(
      "[handleSend] Sending message:",
      input.trim(),
      "sessionId:",
      sessionId,
      "ws.readyState:",
      ws.readyState
    );
    ws.send(input.trim());

    // Reset input và chuẩn bị cho streaming
    setInput("");
    setStreamingMessage("");
    setIsStreaming(false); // Chờ response từ server

    // Đảm bảo session được lưu
    if (sessionId) {
      localStorage.setItem("chatbotSessionId", sessionId);
      console.log("[handleSend] Saved session to localStorage:", sessionId);
    }
  };

  // Xử lý phím Enter
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Xóa lịch sử chat
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("chatbotSessionId");
    initializeSession();
    setError("");
  };

  // Kiểm tra URL
  const isUrl = (text: string) => /^https?:\/\//.test(text);

  // Refresh kết nối
  const refreshConnection = () => {
    disconnectWebSocket();
    setTimeout(() => {
      if (open && sessionId) {
        connectWebSocket();
      }
    }, 500);
  };

  return (
    <>
      {/* Nút mở chat */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            borderRadius: "50%",
            width: 60,
            height: 60,
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            fontSize: 28,
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="Mở chatbot"
        >
          🎓
        </button>
      )}

      {/* Chatbox popup */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 380,
            maxWidth: "90vw",
            height: 550,
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 16,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>
                🎓 EDU Chatbot
              </span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    connectionStatus === "connected"
                      ? "#4CAF50"
                      : connectionStatus === "connecting"
                      ? "#FF9800"
                      : "#F44336",
                  animation:
                    connectionStatus === "connecting"
                      ? "pulse 1.5s infinite"
                      : "none",
                }}
                title={`Trạng thái: ${connectionStatus}`}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={refreshConnection}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: 4,
                  color: "#fff",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                title="Refresh kết nối"
              >
                🔄
              </button>
              <button
                onClick={clearHistory}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: 4,
                  color: "#fff",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                title="Xóa lịch sử"
              >
                🗑️
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: 4,
                  color: "#fff",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Session info */}
          <div
            style={{
              padding: "8px 16px",
              background: "#f8f9fa",
              borderBottom: "1px solid #eee",
              fontSize: 11,
              color: "#666",
              fontFamily: "monospace",
            }}
          >
            Session:{" "}
            {sessionId ? sessionId.substring(0, 20) + "..." : "Đang tạo..."}
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: 8,
                background: "#ffebee",
                color: "#c62828",
                fontSize: 12,
                borderBottom: "1px solid #eee",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              background: "#f7f9fa",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: 14,
                  padding: 20,
                }}
              >
                👋 Xin chào! Tôi là chatbot giáo dục.
                <br />
                Hãy hỏi tôi về điểm chuẩn, trường học, ngành học...
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #667eea, #764ba2)"
                        : "#fff",
                    color: msg.role === "user" ? "#fff" : "#333",
                    borderRadius: 18,
                    padding: "10px 14px",
                    maxWidth: 280,
                    wordBreak: "break-word",
                    boxShadow:
                      msg.role === "user"
                        ? "0 2px 8px rgba(102, 126, 234, 0.3)"
                        : "0 2px 8px rgba(0,0,0,0.1)",
                    border:
                      msg.role === "assistant" ? "1px solid #e0e0e0" : "none",
                    animation: "fadeIn 0.3s ease-in",
                  }}
                >
                  {isUrl(msg.content) ? (
                    <img
                      src={msg.content}
                      alt="Response image"
                      style={{
                        maxWidth: "100%",
                        borderRadius: 8,
                        display: "block",
                      }}
                    />
                  ) : (
                    <div style={{ lineHeight: 1.4 }}>{msg.content}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {showTypingIndicator && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: "10px 14px",
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 4, alignItems: "center" }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#999",
                        animation: "typing 1.4s infinite",
                      }}
                    />
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#999",
                        animation: "typing 1.4s infinite 0.2s",
                      }}
                    />
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#999",
                        animation: "typing 1.4s infinite 0.4s",
                      }}
                    />
                    <span
                      style={{ marginLeft: 8, color: "#666", fontSize: 12 }}
                    >
                      Đang trả lời...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: 16,
              borderTop: "1px solid #eee",
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Nhập câu hỏi của bạn..."
                style={{
                  flex: 1,
                  borderRadius: 20,
                  border: "2px solid #e0e0e0",
                  padding: "10px 16px",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                disabled={
                  isStreaming ||
                  showTypingIndicator ||
                  connectionStatus !== "connected"
                }
              />
              <button
                onClick={handleSend}
                disabled={
                  isStreaming ||
                  showTypingIndicator ||
                  !input.trim() ||
                  connectionStatus !== "connected"
                }
                style={{
                  background:
                    isStreaming ||
                    showTypingIndicator ||
                    !input.trim() ||
                    connectionStatus !== "connected"
                      ? "#ccc"
                      : "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  cursor:
                    isStreaming ||
                    showTypingIndicator ||
                    !input.trim() ||
                    connectionStatus !== "connected"
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  transition: "transform 0.2s ease",
                }}
                onMouseOver={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }
                }}
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
