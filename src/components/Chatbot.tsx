import React, { useEffect, useRef, useState } from "react";

const BASE_URL_CHATBOT = "http://localhost:8001";
const SESSION_API = BASE_URL_CHATBOT + "/api/v1/chat/session";
const HISTORY_API = BASE_URL_CHATBOT + "/api/v1/chat/history/";
const MESSAGE_API = BASE_URL_CHATBOT + "/api/v1/chat/message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessionList, setShowSessionList] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [error, setError] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug mode flag
  const debug = true;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentStreamingMessage, open]);

  // Load sessions from localStorage
  const loadSessions = (): ChatSession[] => {
    try {
      const stored = localStorage.getItem("chatbotSessions");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("[Chatbot] Error loading sessions:", error);
      return [];
    }
  };

  // Save sessions to localStorage
  const saveSessions = (sessions: ChatSession[]) => {
    try {
      localStorage.setItem("chatbotSessions", JSON.stringify(sessions));
    } catch (error) {
      console.error("[Chatbot] Error saving sessions:", error);
    }
  };

  // Generate session title from first message
  const generateSessionTitle = (firstMessage: string): string => {
    if (firstMessage.length <= 30) return firstMessage;
    return firstMessage.substring(0, 30) + "...";
  };

  // Create new session
  const createSession = async (): Promise<string> => {
    try {
      console.log("[Chatbot] Creating new session...");

      const response = await fetch(SESSION_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const sessionId = String(
        data.session_id ||
          data.data?.session_id ||
          data.data?.sessionId ||
          data.sessionId ||
          ""
      );

      if (!sessionId) {
        throw new Error("Session ID not found in response");
      }

      console.log("[Chatbot] Session created successfully:", sessionId);
      return sessionId;
    } catch (error) {
      console.error("[Chatbot] Error creating session:", error);
      throw error;
    }
  };

  // Initialize sessions on mount
  useEffect(() => {
    const initializeSessions = async () => {
      try {
        const storedSessions = loadSessions();
        setSessions(storedSessions);

        if (storedSessions.length > 0) {
          // Use the most recent session
          const latestSession = storedSessions[0];
          setCurrentSessionId(latestSession.id);
          console.log("[Chatbot] Using latest session:", latestSession.id);
        }
      } catch (error) {
        console.error("[Chatbot] Error initializing sessions:", error);
        setError("Failed to initialize chat sessions");
      }
    };

    initializeSessions();
  }, []);

  // Load history when session changes
  useEffect(() => {
    if (!currentSessionId || !open) return;

    const fetchHistory = async () => {
      try {
        setConnectionStatus("connecting");
        console.log(
          "[Chatbot] Fetching history for session:",
          currentSessionId
        );

        const response = await fetch(HISTORY_API + currentSessionId);

        if (!response.ok) {
          if (response.status === 404 || response.status === 400) {
            console.log("[Chatbot] Session not found, creating new session...");
            await handleNewSession();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const historyData = Array.isArray(data.data) ? data.data : [];
        historyData.reverse();
        const messages = transformHistoryData(historyData);

        setMessages(messages);
        setConnectionStatus("connected");
        console.log(
          "[Chatbot] History loaded successfully, messages:",
          messages.length
        );
      } catch (error) {
        console.error("[Chatbot] Error fetching history:", error);
        setMessages([]);
        setConnectionStatus("disconnected");
        setError("Unable to load chat history");
      }
    };

    fetchHistory();
  }, [currentSessionId, open]);

  // Transform server data to frontend format
  const transformHistoryData = (serverData: any[]): Message[] => {
    const flatMessages: Message[] = [];

    serverData.forEach((item: any) => {
      if (item.user_message && item.user_message.trim()) {
        flatMessages.push({
          role: "user",
          content: item.user_message.trim(),
        });
      }

      if (item.bot_response && item.bot_response.trim()) {
        flatMessages.push({
          role: "assistant",
          content: item.bot_response.trim(),
        });
      }
    });

    return flatMessages;
  };

  // Update session info
  const updateSessionInfo = (sessionId: string, firstMessage: string) => {
    const currentSessions = loadSessions();
    const sessionIndex = currentSessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex >= 0) {
      // Update existing session
      currentSessions[sessionIndex] = {
        ...currentSessions[sessionIndex],
        lastMessage:
          firstMessage.substring(0, 50) +
          (firstMessage.length > 50 ? "..." : ""),
        timestamp: Date.now(),
        messageCount: Math.ceil(messages.length / 2) + 1,
      };
    } else {
      // Create new session entry
      const newSession: ChatSession = {
        id: sessionId,
        title: generateSessionTitle(firstMessage),
        lastMessage:
          firstMessage.substring(0, 50) +
          (firstMessage.length > 50 ? "..." : ""),
        timestamp: Date.now(),
        messageCount: 1,
      };

      // Add to beginning and limit to 3 sessions
      currentSessions.unshift(newSession);
      if (currentSessions.length > 3) {
        currentSessions.splice(3);
      }
    }

    saveSessions(currentSessions);
    setSessions([...currentSessions]);
  };

  // Send message
  const handleSend = async () => {
    setError("");

    if (!input.trim()) {
      setError("Please enter a message!");
      return;
    }

    if (!currentSessionId) {
      // Create new session if none exists
      await handleNewSession();
      return;
    }

    if (isStreaming) {
      setError("Please wait for the current message to complete!");
      return;
    }

    setIsStreaming(true);
    setCurrentStreamingMessage("");

    const userInput = input;
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setInput("");

    // Update session info with first message
    if (messages.length === 0) {
      updateSessionInfo(currentSessionId, userInput);
    }

    try {
      const response = await fetch(MESSAGE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSessionId,
          user_message: userInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No stream body!");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (chunk.startsWith("[ERROR]:")) {
          console.error("[Chatbot] Server error:", chunk);
          setError(chunk.replace("[ERROR]:", "").trim());
          setIsStreaming(false);
          setCurrentStreamingMessage("");
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        assistantMessage += chunk;
        setCurrentStreamingMessage(assistantMessage);
      }

      if (assistantMessage.trim()) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantMessage },
        ]);
      }

      setCurrentStreamingMessage("");
    } catch (error) {
      console.error("[Chatbot] Error sending message:", error);
      setError("Failed to send message to server!");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  // Handle Enter key
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Create new session
  const handleNewSession = async () => {
    try {
      setMessages([]);
      setCurrentStreamingMessage("");
      setError("");
      setConnectionStatus("connecting");

      const newSessionId = await createSession();
      setCurrentSessionId(newSessionId);
      setConnectionStatus("connected");

      console.log("[Chatbot] New session created:", newSessionId);
    } catch (error) {
      console.error("[Chatbot] Error creating new session:", error);
      setError("Unable to create new chat session");
      setConnectionStatus("disconnected");
    }
  };

  // Switch to different session
  const handleSwitchSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;

    setCurrentSessionId(sessionId);
    setShowSessionList(false);
    setMessages([]);
    setError("");
  };

  // Delete session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const currentSessions = loadSessions();
    const filteredSessions = currentSessions.filter((s) => s.id !== sessionId);

    saveSessions(filteredSessions);
    setSessions(filteredSessions);

    if (sessionId === currentSessionId) {
      if (filteredSessions.length > 0) {
        setCurrentSessionId(filteredSessions[0].id);
      } else {
        setCurrentSessionId("");
        setMessages([]);
      }
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chat-fab"
          aria-label="Open EduPath AI Chatbot"
        >
          🎓
        </button>
      )}

      {/* Chatbox */}
      {open && (
        <div className="chatbox">
          {/* Header */}
          <div className="chat-header">
            <div className="header-left">
              <div className="header-title">
                🎓 EduPath AI
                <div className="header-subtitle">Academic Counseling</div>
              </div>
              <div
                className={`connection-status ${connectionStatus}`}
                title={`Status: ${connectionStatus}`}
              />
            </div>
            <div className="header-actions">
              <button
                onClick={() => setShowSessionList(!showSessionList)}
                className="header-btn"
                title="Chat History"
              >
                📋
                {sessions.length > 0 && (
                  <span className="session-count">{sessions.length}</span>
                )}
              </button>
              <button
                onClick={handleNewSession}
                className="header-btn"
                title="New Chat"
              >
                ➕
              </button>
              <button
                onClick={() => setOpen(false)}
                className="header-btn close-btn"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Session List */}
          {showSessionList && (
            <div className="session-list">
              <div className="session-list-header">
                <h4>Recent Chats (Max 3)</h4>
              </div>
              {sessions.length === 0 ? (
                <div className="no-sessions">No chat history yet</div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`session-item ${
                      session.id === currentSessionId ? "active" : ""
                    }`}
                    onClick={() => handleSwitchSession(session.id)}
                  >
                    <div className="session-content">
                      <div className="session-title">{session.title}</div>
                      <div className="session-meta">
                        <span className="session-time">
                          {formatTimestamp(session.timestamp)}
                        </span>
                        <span className="session-messages">
                          {session.messageCount} messages
                        </span>
                      </div>
                      <div className="session-preview">
                        {session.lastMessage}
                      </div>
                    </div>
                    <button
                      className="delete-session"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      title="Delete this chat"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Session Info
          <div className="session-info">
            Current Session:{" "}
            {currentSessionId
              ? currentSessionId.substring(0, 8) + "..."
              : "None"}
          </div> */}

          {/* Error Message */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* Messages */}
          <div className="messages-container">
            {messages.length === 0 && !error ? (
              <div className="welcome-message">
                <div className="welcome-icon">🎯</div>
                <h3>Chào mừng tới EduPath AI!</h3>
                <p>Tôi có thể giúp bạn với:</p>
                <div className="feature-list">
                  <div className="feature-item">
                    🏫 Chọn trường & chuyên ngành
                  </div>
                  <div className="feature-item">📊 Điểm chuẩn & yêu cầu</div>
                  <div className="feature-item">💰 Học phí & chương trình</div>
                  <div className="feature-item">📅 Ngày nộp hồ sơ</div>
                  <div className="feature-item">🎯 Hướng nghề nghiệp</div>
                </div>
                <p className="start-prompt">
                  Hãy hỏi tôi bất cứ điều gì để bắt đầu!
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div
                    className="message-content"
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(
                        /\*\*(.*?)\*\*/g,
                        "<strong>$1</strong>"
                      ),
                    }}
                  />
                </div>
              ))
            )}

            {/* Streaming Message */}
            {isStreaming && (
              <div className="message assistant streaming">
                <div className="message-content">
                  {currentStreamingMessage || (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                      EduPath is thinking...
                    </div>
                  )}
                  {currentStreamingMessage && <span className="cursor">|</span>}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-wrapper">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Hỏi EduPath AI ..."
                className={`message-input ${error ? "error" : ""}`}
                disabled={isStreaming || connectionStatus !== "connected"}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={
                  isStreaming ||
                  !input.trim() ||
                  connectionStatus !== "connected"
                }
                className="send-button"
                title={!input.trim() ? "Enter a message" : "Send message"}
              >
                {isStreaming ? "⏳" : "➤"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-fab:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
        }

        .chatbox {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 420px;
          max-width: 90vw;
          height: 700px;
          max-height: 85vh;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title {
          font-weight: 700;
          font-size: 16px;
          line-height: 1.2;
        }

        .header-subtitle {
          font-size: 12px;
          opacity: 0.9;
          font-weight: 400;
        }

        .connection-status {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .connection-status.connected {
          background: #4ade80;
        }
        .connection-status.connecting {
          background: #fbbf24;
          animation: pulse 1.5s infinite;
        }
        .connection-status.disconnected {
          background: #ef4444;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .header-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .session-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .session-list {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          max-height: 300px;
          overflow-y: auto;
        }

        .session-list-header {
          padding: 16px 20px 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .session-list-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
        }

        .no-sessions {
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .session-item {
          padding: 12px 20px;
          border-bottom: 1px solid #e2e8f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .session-item:hover {
          background: #e2e8f0;
        }

        .session-item.active {
          background: #ddd6fe;
          border-left: 4px solid #8b5cf6;
        }

        .session-content {
          flex: 1;
          min-width: 0;
        }

        .session-title {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .session-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 4px;
        }

        .session-time,
        .session-messages {
          font-size: 11px;
          color: #64748b;
        }

        .session-preview {
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .delete-session {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .session-item:hover .delete-session {
          opacity: 1;
        }

        .delete-session:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .session-info {
          padding: 8px 20px;
          background: #f1f5f9;
          font-size: 11px;
          color: #64748b;
          font-family: "Courier New", monospace;
          border-bottom: 1px solid #e2e8f0;
        }

        .error-message {
          padding: 12px 20px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 13px;
          border-bottom: 1px solid #fecaca;
          text-align: center;
          font-weight: 500;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .welcome-message {
          text-align: center;
          padding: 40px 20px;
          color: #475569;
        }

        .welcome-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .welcome-message h3 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .welcome-message p {
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .feature-list {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .feature-item {
          padding: 8px 0;
          font-size: 14px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .feature-item:last-child {
          border-bottom: none;
        }

        .start-prompt {
          font-size: 13px;
          color: #64748b;
          font-style: italic;
        }

        .message {
          margin-bottom: 16px;
          display: flex;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.assistant {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-line;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.assistant .message-content {
          background: white;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .message.streaming .message-content {
          border-left: 4px solid #8b5cf6;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-style: italic;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8b5cf6;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        .cursor {
          animation: blink 1s infinite;
          color: #8b5cf6;
          font-weight: bold;
        }

        .input-area {
          padding: 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .input-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          min-height: 44px;
          max-height: 120px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 12px 16px;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          outline: none;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .message-input:focus {
          border-color: #8b5cf6;
          background: white;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .message-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .message-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        }

        .send-button:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        /* Scrollbar styling */
        .messages-container::-webkit-scrollbar,
        .session-list::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track,
        .session-list::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .messages-container::-webkit-scrollbar-thumb,
        .session-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover,
        .session-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .chatbox {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }

          .chat-fab {
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
