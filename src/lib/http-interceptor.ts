// HTTP Interceptor para monitoramento de requisições
export interface HttpRequest {
  id: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp: number;
}

export interface HttpResponse {
  id: string;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  data?: any;
  timestamp: number;
  duration: number;
}

export interface HttpError {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
}

type HttpListener = {
  onRequest?: (request: HttpRequest) => void;
  onResponse?: (response: HttpResponse) => void;
  onError?: (error: HttpError) => void;
};

class HttpInterceptor {
  private listeners: HttpListener[] = [];
  private originalFetch: typeof fetch | null = null;
  private isInitialized = false;

  constructor() {
    // Evitar acesso ao window durante SSR
    if (typeof window !== 'undefined') {
      this.originalFetch = window.fetch;
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).fetch) {
      this.originalFetch = (globalThis as any).fetch as typeof fetch;
    }
  }

  init() {
    if (this.isInitialized) return;
    if (typeof window === 'undefined') return; // Só inicializa no cliente

    // Sempre capturar o fetch real do browser e fazer bind ao window
    this.originalFetch = window.fetch.bind(window) as typeof fetch;

    // Interceptar fetch
    const self = this;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const requestId = self.generateId();
      const startTime = Date.now();

      // Preparar dados da requisição
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      const method = init?.method || 'GET';
      
      const request: HttpRequest = {
        id: requestId,
        method,
        url,
        headers: init?.headers as Record<string, string>,
        body: init?.body,
        timestamp: startTime
      };

      // Notificar listeners sobre a requisição
      self.notifyRequest(request);

      try {
        const response = await (self.originalFetch as typeof fetch)(input as any, init);
        const endTime = Date.now();

        // Preparar dados da resposta
        const httpResponse: HttpResponse = {
          id: requestId,
          status: response.status,
          statusText: response.statusText,
          headers: typeof response.headers?.entries === 'function' ? Object.fromEntries(response.headers.entries()) : undefined,
          timestamp: endTime,
          duration: endTime - startTime
        };

        // Notificar listeners sobre a resposta
        self.notifyResponse(httpResponse);

        return response;
      } catch (error: any) {
        const httpError: HttpError = {
          id: requestId,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: Date.now()
        };

        // Notificar listeners sobre o erro
        self.notifyError(httpError);

        throw error;
      }
    } as typeof fetch;

    this.isInitialized = true;
  }

  addListener(listener: HttpListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: HttpListener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  destroy() {
    if (this.isInitialized && typeof window !== 'undefined' && this.originalFetch) {
      window.fetch = this.originalFetch as typeof fetch;
      this.listeners = [];
      this.isInitialized = false;
    }
  }

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyRequest(request: HttpRequest) {
    this.listeners.forEach(listener => {
      if (listener.onRequest) {
        try {
          listener.onRequest(request);
        } catch (error) {
          console.error('Error in HTTP request listener:', error);
        }
      }
    });
  }

  private notifyResponse(response: HttpResponse) {
    this.listeners.forEach(listener => {
      if (listener.onResponse) {
        try {
          listener.onResponse(response);
        } catch (error) {
          console.error('Error in HTTP response listener:', error);
        }
      }
    });
  }

  private notifyError(error: HttpError) {
    this.listeners.forEach(listener => {
      if (listener.onError) {
        try {
          listener.onError(error);
        } catch (error) {
          console.error('Error in HTTP error listener:', error);
        }
      }
    });
  }
}

// Instância singleton
export const httpInterceptor = new HttpInterceptor();