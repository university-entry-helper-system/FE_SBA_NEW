// import React, { useEffect, useState } from 'react';
// import { getConsultantProfiles } from '../api/consultant';
// import type { ConsultantProfile } from '../types/consultant';
// import ConsultationChatModal from './ConsultationChatModal';
// import NotificationPanel from './NotificationPanel';
// import { useConsultationWebSocket, useWebSocketCleanup } from '../hooks/useConsultationWebSocket';
// import { WebSocketNotification } from '../types/consultation';
// import maleAvatar from '../assets/3270921.png';
// import femaleAvatar from '../assets/3270920.png';
// import { useAuth } from '../contexts/AuthProvider'; // Update this import path

// const ConsultantList: React.FC = () => {
//   const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [hoveredId, setHoveredId] = useState<string | null>(null);

//   // Chat modal states
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [selectedConsultant, setSelectedConsultant] = useState<ConsultantProfile | null>(null);
//     const { user, isAuthenticated } = useAuth();

//   // WebSocket connection with custom hook
//   const {
//     notifications,
//     unreadCount,
//     clearNotifications,
//     markAsRead,
//     connectionStatus,
//     reconnect
//   } = useConsultationWebSocket({
//     userId: user?.accountId || '',
//     userRole: user?.roleName || 'USER',
//     authToken: localStorage.getItem('accessToken') || '', // This is the correct way
//     enabled: isAuthenticated,
//     onNotification: handleWebSocketNotification,
//     onConnect: () => console.log('WebSocket connected successfully'),
//     onDisconnect: () => console.log('WebSocket disconnected'),
//     onError: (error) => console.error('WebSocket connection error:', error)
//   });

//   // Cleanup WebSocket on app close/logout
//   useWebSocketCleanup();

//   useEffect(() => {
//     fetchConsultants();
//   }, []);

//   const fetchConsultants = async () => {
//     try {
//       setLoading(true);
//       const response = await getConsultantProfiles({ page: 0, size: 9 });
//       setConsultants(response.data.result.content);
//       setError('');
//     } catch (err: any) {
//       setError(err.message || 'Failed to load consultants');
//     } finally {
//       setLoading(false);
//     }
//   };

//   function handleWebSocketNotification(notification: WebSocketNotification) {
//     // Show toast notification
//     showToastNotification(notification);

//     // Handle specific notification actions
//     switch (notification.type) {
//       case 'CONSULTATION_ANSWERED':
//       case 'CONSULTATION_UPDATED':
//         // If chat modal is open and it's for the same consultation, refresh it
//         if (isChatOpen && selectedConsultant) {
//           // The chat modal will handle its own refresh via its WebSocket connection
//         }
//         break;
//     }
//   }

//   const showToastNotification = (notification: WebSocketNotification) => {
//     // Create and show toast notification
//     const toast = document.createElement('div');
//     toast.style.cssText = `
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       color: white;
//       padding: 16px 20px;
//       border-radius: '12px';
//       box-shadow: 0 10px 25px rgba(0,0,0,0.2);
//       z-index: 10001;
//       max-width: 320px;
//       animation: slideInRight 0.3s ease-out;
//       backdrop-filter: blur(10px);
//     `;

//     const iconMap = {
//       'NEW_CONSULTATION': '❓',
//       'CONSULTATION_ANSWERED': '✅',
//       'CONSULTATION_UPDATED': '✏️',
//       'CONSULTATION_CANCELLED': '❌',
//       'STATS_UPDATE': '📊'
//     };

//     toast.innerHTML = `
//       <div style="display: flex; align-items: flex-start; gap: 12px;">
//         <div style="font-size: 1.5rem; flex-shrink: 0;">
//           ${iconMap[notification.type] || '🔔'}
//         </div>
//         <div style="flex: 1;">
//           <div style="font-weight: 600; margin-bottom: 4px; font-size: 0.9rem;">
//             ${getNotificationTitle(notification.type)}
//           </div>
//           <div style="font-size: 0.85rem; opacity: 0.95; line-height: 1.4;">
//             ${notification.message}
//           </div>
//         </div>
//         <button onclick="this.parentElement.parentElement.remove()"
//                 style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; opacity: 0.7; padding: 0; margin-left: 8px;">
//           ×
//         </button>
//       </div>
//     `;

//     document.body.appendChild(toast);

//     // Auto remove after 5 seconds
//     setTimeout(() => {
//       if (document.body.contains(toast)) {
//         toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
//         setTimeout(() => {
//           if (document.body.contains(toast)) {
//             document.body.removeChild(toast);
//           }
//         }, 300);
//       }
//     }, 5000);

//     // Add CSS animations if not already added
//     if (!document.getElementById('toast-animations')) {
//       const style = document.createElement('style');
//       style.id = 'toast-animations';
//       style.textContent = `
//         @keyframes slideInRight {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//         @keyframes slideOutRight {
//           from { transform: translateX(0); opacity: 1; }
//           to { transform: translateX(100%); opacity: 0; }
//         }
//       `;
//       document.head.appendChild(style);
//     }
//   };
// type NotificationType =
//   | 'NEW_CONSULTATION'
//   | 'CONSULTATION_ANSWERED'
//   | 'CONSULTATION_UPDATED'
//   | 'CONSULTATION_CANCELLED'
//   | 'STATS_UPDATE';
//   const getNotificationTitle = (type: NotificationType): string => {
//   const titles: Record<NotificationType, string> = {
//     'NEW_CONSULTATION': 'Có câu hỏi mới',
//     'CONSULTATION_ANSWERED': 'Câu hỏi đã được trả lời',
//     'CONSULTATION_UPDATED': 'Câu hỏi đã được cập nhật',
//     'CONSULTATION_CANCELLED': 'Câu hỏi đã bị hủy',
//     'STATS_UPDATE': 'Cập nhật thống kê'
//   };
//   return titles[type] || 'Thông báo mới';
// };
//   const getAvatarByGender = (gender: string) => {
//     return gender === 'female' ? femaleAvatar : maleAvatar;
//   };

//   const handleChatClick = (consultant: ConsultantProfile) => {
//     if (!isAuthenticated) {
//       alert('Vui lòng đăng nhập để sử dụng tính năng tư vấn');
//       return;
//     }

//     setSelectedConsultant(consultant);
//     setIsChatOpen(true);
//   };

//   const handleCloseChatModal = () => {
//     setIsChatOpen(false);
//     setSelectedConsultant(null);
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div style={{
//         maxWidth: 1200,
//         margin: '0 auto',
//         padding: '32px 16px',
//         textAlign: 'center'
//       }}>
//         <div style={{
//           display: 'inline-block',
//           width: '40px',
//           height: '40px',
//           border: '4px solid #f3f4f6',
//           borderTop: '4px solid #3b82f6',
//           borderRadius: '50%',
//           animation: 'spin 1s linear infinite',
//           marginBottom: '16px'
//         }} />
//         <div style={{ fontSize: '1.1rem', color: '#666' }}>
//           Đang tải danh sách tư vấn viên...
//         </div>
//         <style>
//           {`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}
//         </style>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div style={{
//         maxWidth: 1200,
//         margin: '0 auto',
//         padding: '32px 16px',
//         textAlign: 'center'
//       }}>
//         <div style={{
//           color: '#ef4444',
//           fontSize: '1.1rem',
//           background: '#fef2f2',
//           padding: '16px',
//           borderRadius: '8px',
//           marginBottom: '16px'
//         }}>
//           {error}
//         </div>
//         <button
//           onClick={fetchConsultants}
//           style={{
//             background: '#3b82f6',
//             color: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             padding: '10px 20px',
//             cursor: 'pointer',
//             fontSize: '1rem'
//           }}
//         >
//           Thử lại
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
//       {/* Header with notifications */}
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: 12
//       }}>
//         <div>
//           <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#222', margin: 0 }}>
//             Tư vấn tuyển sinh
//           </h1>
//         </div>

//         {/* Connection Status & Notifications */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//           {/* Connection Status Indicator */}
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '6px',
//             padding: '6px 12px',
//             borderRadius: '20px',
//             background: connectionStatus === 'connected' ? '#d1fae5' :
//                        connectionStatus === 'connecting' ? '#fef3c7' : '#fee2e2',
//             fontSize: '0.8rem',
//             fontWeight: 500
//           }}>
//             <div style={{
//               width: '8px',
//               height: '8px',
//               borderRadius: '50%',
//               background: connectionStatus === 'connected' ? '#10b981' :
//                          connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444'
//             }} />
//             {connectionStatus === 'connected' && 'Đã kết nối'}
//             {connectionStatus === 'connecting' && 'Đang kết nối...'}
//             {connectionStatus === 'disconnected' && 'Mất kết nối'}
//             {connectionStatus === 'error' && 'Lỗi kết nối'}
//           </div>

//           {/* Retry button for failed connections */}
//           {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
//             <button
//               onClick={reconnect}
//               style={{
//                 background: '#3b82f6',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '6px',
//                 padding: '6px 12px',
//                 fontSize: '0.8rem',
//                 cursor: 'pointer'
//               }}
//               title="Kết nối lại"
//             >
//               🔄
//             </button>
//           )}

//           {/* Notification Panel */}
//           {isAuthenticated && (
//             <NotificationPanel
//               notifications={notifications}
//               unreadCount={unreadCount}
//               onMarkAsRead={markAsRead}
//               onClearAll={clearNotifications}
//             />
//           )}
//         </div>
//       </div>

//       <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: 32 }}>
//         Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn về thông tin tuyển sinh,
//         chọn ngành, chọn trường, giải đáp thắc mắc về quy chế, hồ sơ, điểm chuẩn và
//         các vấn đề liên quan đến đại học.
//       </p>

//       {/* Consultants Grid */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//         gap: '24px'
//       }}>
//         {consultants.map((consultant) => (
//           <div
//             key={consultant.accountId}
//             style={{
//               background: '#fff',
//               borderRadius: '16px',
//               padding: '24px',
//               boxShadow: hoveredId === consultant.accountId
//                 ? '0 12px 40px rgba(0,0,0,0.15)'
//                 : '0 4px 20px rgba(0,0,0,0.08)',
//               transition: 'all 0.3s ease',
//               transform: hoveredId === consultant.accountId ? 'translateY(-4px)' : 'translateY(0)',
//               border: '1px solid #f1f5f9'
//             }}
//             onMouseEnter={() => setHoveredId(consultant.accountId)}
//             onMouseLeave={() => setHoveredId(null)}
//           >
//             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
//               <img
//                 src={consultant.avatarUrl || getAvatarByGender(consultant.gender)}
//                 alt={consultant.fullName}
//                 style={{
//                   width: '80px',
//                   height: '80px',
//                   borderRadius: '50%',
//                   objectFit: 'cover',
//                   marginRight: '16px',
//                   border: '3px solid #f8fafc'
//                 }}
//               />
//               <div>
//                 <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.1rem' }}>
//                   {consultant.fullName}
//                 </h3>
//                 <div style={{
//                   display: 'flex',
//                   flexWrap: 'wrap',
//                   gap: '6px'
//                 }}>
//                   {consultant.specialties.map((specialty) => (
//                     <span
//                       key={specialty.id}
//                       style={{
//                         fontSize: '0.75rem',
//                         padding: '4px 10px',
//                         borderRadius: '12px',
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         color: 'white',
//                         fontWeight: 500
//                       }}
//                     >
//                       {specialty.name}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <p style={{
//               margin: '0 0 20px 0',
//               fontSize: '0.9rem',
//               color: '#64748b',
//               lineHeight: '1.6'
//             }}>
//               {consultant.bio}
//             </p>

//             <button
//               onClick={() => handleChatClick(consultant)}
//               disabled={!isAuthenticated}
//               style={{
//                 width: '100%',
//                 padding: '14px',
//                 background: hoveredId === consultant.accountId
//                   ? 'linear-gradient(135deg, #5a6fd6 0%, #6a4c93 100%)'
//                   : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '12px',
//                 fontSize: '1rem',
//                 cursor: isAuthenticated ? 'pointer' : 'not-allowed',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '10px',
//                 transition: 'all 0.3s ease',
//                 fontWeight: 600,
//                 opacity: isAuthenticated ? 1 : 0.6
//               }}
//             >
//               <span style={{ fontSize: '1.3rem' }}>💬</span>
//               {isAuthenticated ? 'Chat với tư vấn viên' : 'Đăng nhập để chat'}
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Chat Modal */}
//       {selectedConsultant && isAuthenticated && (
//         <ConsultationChatModal
//           isOpen={isChatOpen}
//           onClose={handleCloseChatModal}
//           consultant={selectedConsultant}
//           currentUserId={user?.accountId || ''}
//           userRole={user?.roleName || 'USER'}
//           authToken={isAuthenticated ? localStorage.getItem('accessToken') || '' : ''}
//         />
//       )}
//     </div>
//   );
// };

// export default ConsultantList;
