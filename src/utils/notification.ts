import { WebSocketNotification, NotificationType } from '../types/consultation';

export const showToastNotification = (notification: WebSocketNotification) => {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 10001;
    max-width: 320px;
    animation: slideInRight 0.3s ease-out;
    backdrop-filter: blur(10px);
  `;

  const iconMap = {
    [NotificationType.NEW_CONSULTATION]: '❓',
    [NotificationType.CONSULTATION_ANSWERED]: '✅',
    [NotificationType.CONSULTATION_UPDATED]: '✏️',
    [NotificationType.CONSULTATION_CANCELLED]: '❌',
    [NotificationType.STATS_UPDATE]: '📊',
  };

  const getNotificationTitle = (type: NotificationType): string => {
    const titles: Record<NotificationType, string> = {
      [NotificationType.NEW_CONSULTATION]: 'Có câu hỏi mới',
      [NotificationType.CONSULTATION_ANSWERED]: 'Câu hỏi đã được trả lời',
      [NotificationType.CONSULTATION_UPDATED]: 'Câu hỏi đã được cập nhật',
      [NotificationType.CONSULTATION_CANCELLED]: 'Câu hỏi đã bị hủy',
      [NotificationType.STATS_UPDATE]: 'Cập nhật thống kê',
    };
    return titles[type] || 'Thông báo mới';
  };

  toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="font-size: 1.5rem; flex-shrink: 0;">
        ${iconMap[notification.type] || '🔔'}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px; font-size: 0.9rem;">
          ${getNotificationTitle(notification.type)}
        </div>
        <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">
          ${notification.message}
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; opacity: 0.7; padding: 0; margin-left: 8px;">
        ×
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }
  }, 5000);

  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
};