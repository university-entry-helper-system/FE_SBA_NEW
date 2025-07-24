// utils/consultationSocket.ts

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebSocketNotification } from '../types/consultation';


export interface ConsultationSocketConfig {
  baseUrl: string;
  userId: string;
  userRole: string;
  authToken: string;
  onNotification?: (notification: WebSocketNotification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export class ConsultationWebSocketClient {
  private client: Client | null = null;
  private config: ConsultationSocketConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(config: ConsultationSocketConfig) {
    this.config = config;
  }

  connect(): void {
    try {
      // Create SockJS instance
      const socket = new SockJS(`${this.config.baseUrl}/ws-consultations`);
      
      // Create STOMP client
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          'Authorization': `Bearer ${this.config.authToken}`
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Set up event handlers
      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribeToNotifications();
        this.sendSubscriptionMessage();
        this.config.onConnect?.();
      };

      this.client.onDisconnect = () => {
        console.log('Disconnected from WebSocket');
        this.isConnected = false;
        this.config.onDisconnect?.();
      };

      this.client.onStompError = (frame) => {
        console.error('WebSocket STOMP error:', frame);
        this.config.onError?.(frame);
        this.handleReconnect();
      };

      this.client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        this.config.onError?.(error);
        this.handleReconnect();
      };

      // Activate the client
      this.client.activate();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.config.onError?.(error);
      this.handleReconnect();
    }
  }

  private subscribeToNotifications(): void {
    if (!this.client || !this.isConnected) return;

    // Subscribe to user/consultant specific topic
    let topicPath: string;
    if (this.config.userRole === 'CONSULTANT' || this.config.userRole === 'ADMIN') {
      topicPath = `/topic/consultant/${this.config.userId}`;
    } else {
      topicPath = `/topic/user/${this.config.userId}`;
    }

    this.client.subscribe(topicPath, (message) => {
      try {
        const notification: WebSocketNotification = JSON.parse(message.body);
        console.log('Received notification:', notification);
        this.config.onNotification?.(notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    });

    console.log(`Subscribed to: ${topicPath}`);

    // Subscribe to general stats updates (optional)
    this.client.subscribe('/topic/consultation/stats', (message) => {
      try {
        const statsUpdate: WebSocketNotification = JSON.parse(message.body);
        console.log('Received stats update:', statsUpdate);
        this.config.onNotification?.(statsUpdate);
      } catch (error) {
        console.error('Failed to parse stats update:', error);
      }
    });
  }

  private sendSubscriptionMessage(): void {
    if (!this.client || !this.isConnected) return;

    const subscriptionData = {
      userId: this.config.userId,
      role: this.config.userRole,
      timestamp: new Date().toISOString()
    };

    this.client.publish({
      destination: '/app/consultation/subscribe',
      body: JSON.stringify(subscriptionData)
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  isClientConnected(): boolean {
    return this.isConnected && this.client?.connected === true;
  }

  // Update config (useful for token refresh)
  updateConfig(newConfig: Partial<ConsultationSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // If auth token changed, reconnect
    if (newConfig.authToken && this.isConnected) {
      this.disconnect();
      setTimeout(() => this.connect(), 1000);
    }
  }
}

// Singleton instance for global use
let globalWebSocketClient: ConsultationWebSocketClient | null = null;

export const initializeWebSocket = (config: ConsultationSocketConfig): ConsultationWebSocketClient => {
  if (globalWebSocketClient) {
    globalWebSocketClient.disconnect();
  }
  
  globalWebSocketClient = new ConsultationWebSocketClient(config);
  globalWebSocketClient.connect();
  
  return globalWebSocketClient;
};

export const getWebSocketClient = (): ConsultationWebSocketClient | null => {
  return globalWebSocketClient;
};

export const disconnectWebSocket = (): void => {
  if (globalWebSocketClient) {
    globalWebSocketClient.disconnect();
    globalWebSocketClient = null;
  }
};