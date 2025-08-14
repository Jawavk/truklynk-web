export class WebSocketService {
  private socket: WebSocket | null = null;
  private maxRetries = 3;
  private retryDelay = 2000;

  private getWebSocketUrl(): string {
    const host = import.meta.env.VITE_WS_HOST;
    const port = import.meta.env.VITE_WS_PORT;
    const endpoint = import.meta.env.VITE_WS_ENDPOINT;

    return `ws://${host}:${port}/${endpoint}`;
  }

  async connect(retryCount = 0): Promise<WebSocket> {
    const url = this.getWebSocketUrl();

    return new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';

        socket.onopen = () => {
          this.socket = socket;
          console.log('WebSocket connected');
          resolve(socket);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          socket.close();
        };


        socket.onclose = () => {
          if (retryCount < this.maxRetries) {
            console.warn(`Retrying WebSocket in ${this.retryDelay / 1000}s... (${retryCount + 1}/${this.maxRetries})`);
            setTimeout(() => {
              this.connect(retryCount + 1).then(resolve).catch(reject);
            }, this.retryDelay);
          } else {
            reject(new Error('Max WebSocket connection retries exceeded.'));
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }

  getSocket(): WebSocket | null {
    return this.socket;
  }
}