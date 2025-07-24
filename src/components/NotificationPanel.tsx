// components/NotificationPanel.tsx

import React, { useState } from 'react';
import { WebSocketNotification, NotificationType } from '../types/consultation';

interface NotificationPanelProps {
  notifications: WebSocketNotification[];
  unreadCount: number;
  onMarkAsRead: (notificationId?: string) => void;
  onClearAll: () => void;
  className?: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onClearAll,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.NEW_CONSULTATION:
        return '❓';
      case NotificationType.CONSULTATION_ANSWERED:
        return '✅';
      case NotificationType.CONSULTATION_UPDATED:
        return '✏️';
      case NotificationType.CONSULTATION_CANCELLED:
        return '❌';
      case NotificationType.STATS_UPDATE:
        return '📊';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.NEW_CONSULTATION:
        return '#3b82f6';
      case NotificationType.CONSULTATION_ANSWERED:
        return '#10b981';
      case NotificationType.CONSULTATION_UPDATED:
        return '#f59e0b';
      case NotificationType.CONSULTATION_CANCELLED:
        return '#ef4444';
      case NotificationType.STATS_UPDATE:
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    // You can implement navigation logic here
    console.log('Notification clicked:', notification);
  };

  return (
    <div className={`notification-panel ${className}`} style={{ position: 'relative' }}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: unreadCount > 0 ? '#3b82f6' : '#f3f4f6',
          color: unreadCount > 0 ? 'white' : '#6b7280',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          position: 'relative',
          transition: 'all 0.2s ease',
          boxShadow: unreadCount > 0 ? '0 2px 10px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
        }}
        title={`${unreadCount} thông báo chưa đọc`}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          width: '380px',
          maxHeight: '500px',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f9fafb'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>
              Thông báo ({notifications.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={() => onMarkAsRead()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 500
                  }}
                  title="Đánh dấu tất cả đã đọc"
                >
                  Đánh dấu đã đọc
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔕</div>
                <div>Chưa có thông báo nào</div>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id || index}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: index < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                    cursor: 'pointer',
                    background: notification.read ? 'white' : '#f0f9ff',
                    transition: 'background-color 0.2s ease',
                   
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.read ? 'white' : '#f0f9ff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      fontSize: '1.2rem',
                      padding: '8px',
                      background: `${getNotificationColor(notification.type)}15`,
                      borderRadius: '8px',
                      flexShrink: 0
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: notification.read ? 400 : 600,
                        color: '#1f2937',
                        marginBottom: '4px',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        {!notification.read && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            background: '#3b82f6',
                            borderRadius: '50%'
                          }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 500
                }}
              >
                Xóa tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationPanel;