export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private listeners: { [key: string]: Function[] } = {};

  constructor(url: string) {
    this.url = url;
    console.log("[WebSocketManager] Initialized with URL:", this.url);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log("[WebSocketManager] Attempting to connect to:", this.url);

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("[WebSocketManager] Connected to backend:", this.url);
          this.reconnectAttempts = 0;
          this.emit("connect");
          resolve();
        };

        this.ws.onmessage = (event) => {
          console.log("[WebSocketManager] Message received:", event.data);
          try {
            const data = JSON.parse(event.data);
            this.emit("message", data);
          } catch (error) {
            console.error("[WebSocketManager] Error parsing WebSocket message:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.warn(
            `[WebSocketManager] Connection closed (Code: ${event.code}, Reason: ${event.reason})`
          );
          this.emit("disconnect");
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("[WebSocketManager] WebSocket error:", error);
          this.emit("error", error);
          reject(error);
        };

      } catch (error) {
        console.error("[WebSocketManager] Exception in connect():", error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      console.log("[WebSocketManager] Disconnecting from server...");
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[WebSocketManager] Sending message:", message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("[WebSocketManager] WebSocket is not connected, cannot send message.");
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocketManager] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("[WebSocketManager] Reconnection failed:", error);
        });
      }, this.reconnectInterval);
    } else {
      console.error("[WebSocketManager] Max reconnection attempts reached");
      this.emit("maxReconnectAttemptsReached");
    }
  }

  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    console.log(`[WebSocketManager] Listener added for event: ${event}`);
  }

  off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      console.log(`[WebSocketManager] Listener removed for event: ${event}`);
    }
  }

  private emit(event: string, ...args: any[]): void {
    console.log(`[WebSocketManager] Emitting event: ${event}`, args);
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }

  isConnected(): boolean {
    const connected = this.ws ? this.ws.readyState === WebSocket.OPEN : false;
    console.log(`[WebSocketManager] isConnected() = ${connected}`);
    return connected;
  }
}
