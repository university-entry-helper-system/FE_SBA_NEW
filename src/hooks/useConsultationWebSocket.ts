// hooks/useConsultationWebSocket.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ConsultationWebSocketClient, 
  initializeWebSocket, 
  getWebSocketClient, 
  disconnectWebSocket 
} from '../utils/consultationSocket';
import { WebSocketNotification, NotificationType } from '../types/consultation';


export interface UseConsultationWebSocketProps {
  userId: string;
  userRole: string;
  authToken: string;
  enabled?: boolean;
  onNotification?: (notification: WebSocketNotification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export interface UseConsultationWebSocketReturn {
  isConnected: boolean;
  notifications: WebSocketNotification[];
  unreadCount: number;
  clearNotifications: () => void;
  markAsRead: (notificationId?: string) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  reconnect: () => void;
}

export const useConsultationWebSocket = ({
  userId,
  userRole,
  authToken,
  enabled = true,
  onNotification,
  onConnect,
  onDisconnect,
  onError
}: UseConsultationWebSocketProps): UseConsultationWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const wsClientRef = useRef<ConsultationWebSocketClient | null>(null);
  const notificationIdCounter = useRef(0);

  const handleNotification = useCallback((notification: WebSocketNotification) => {
    // Add unique ID to notification for tracking
    const notificationWithId = {
      ...notification,
      id: `notification-${Date.now()}-${++notificationIdCounter.current}`,
      read: false
    };

    setNotifications(prev => [notificationWithId, ...prev.slice(0, 49)]); // Keep last 50 notifications
    setUnreadCount(prev => prev + 1);

    // Call external handler
    onNotification?.(notification);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = getNotificationTitle(notification.type);
      new Notification(title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `consultation-${notification.type}`,
        requireInteraction: false
      });
    }
  }, [onNotification]);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionStatus('connected');
    onConnect?.();
  }, [onConnect]);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    onDisconnect?.();
  }, [onDisconnect]);

  const handleError = useCallback((error: any) => {
    setConnectionStatus('error');
    setIsConnected(false);
    onError?.(error);
  }, [onError]);

  const initializeConnection = useCallback(() => {
    if (!enabled || !userId || !authToken) {
      return;
    }

    // Check if there's already a global connection
    let existingClient = getWebSocketClient();
    
    if (existingClient && existingClient.isClientConnected()) {
      wsClientRef.current = existingClient;
      setIsConnected(true);
      setConnectionStatus('connected');
      return;
    }

    setConnectionStatus('connecting');

    const client = initializeWebSocket({
      baseUrl:'http://localhost:8080',
      userId,
      userRole,
      authToken,
      onNotification: handleNotification,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError
    });

    wsClientRef.current = client;
  }, [enabled, userId, userRole, authToken, handleNotification, handleConnect, handleDisconnect, handleError]);

  const reconnect = useCallback(() => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
    }
    setTimeout(initializeConnection, 1000);
  }, [initializeConnection]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } else {
      // Mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Initialize connection
  useEffect(() => {
    initializeConnection();

    return () => {
      // Don't disconnect on cleanup to maintain global connection
      // Only disconnect when the app is closing or user logs out
    };
  }, [initializeConnection]);

  // Update connection when auth token changes
  useEffect(() => {
    if (wsClientRef.current && authToken) {
      wsClientRef.current.updateConfig({ authToken });
    }
  }, [authToken]);

  return {
    isConnected,
    notifications,
    unreadCount,
    clearNotifications,
    markAsRead,
    connectionStatus,
    reconnect
  };
};

const getNotificationTitle = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.NEW_CONSULTATION:
      return 'Có câu hỏi mới';
    case NotificationType.CONSULTATION_ANSWERED:
      return 'Câu hỏi đã được trả lời';
    case NotificationType.CONSULTATION_UPDATED:
      return 'Câu hỏi đã được cập nhật';
    case NotificationType.CONSULTATION_CANCELLED:
      return 'Câu hỏi đã bị hủy';
    case NotificationType.STATS_UPDATE:
      return 'Cập nhật thống kê';
    default:
      return 'Thông báo mới';
  }
};

// Hook for disconnecting WebSocket when user logs out
export const useWebSocketCleanup = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnectWebSocket();
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Disconnect when auth token is removed (logout)
      if (e.key === 'authToken' && !e.newValue) {
        disconnectWebSocket();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};