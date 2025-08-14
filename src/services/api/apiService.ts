import axios from 'axios';
import axiosRetry from 'axios-retry';

// Enhanced Circuit Breaker States
enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
  FORCED_OPEN, // New state for manual control
}

// Enhanced Configuration with more options
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests: number;
  monitorInterval: number;
  timeoutDuration: number;
  healthCheckEndpoint?: string;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 60000,
  halfOpenRequests: 3,
  monitorInterval: 30000, // 30 seconds
  timeoutDuration: 5000, // 5 seconds
  healthCheckEndpoint: '/health',
};

// Custom Error Classes
class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class NetworkError extends APIError {
  constructor(message: string = 'Network connection failed') {
    super(0, message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

class TimeoutError extends APIError {
  constructor(message: string = 'Request timed out') {
    super(408, message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

// Add new error types
class ValidationError extends APIError {
  constructor(message: string, data?: any) {
    super(400, message, 'VALIDATION_ERROR', data);
    this.name = 'ValidationError';
  }
}

class RateLimitError extends APIError {
  constructor(retryAfter?: number) {
    super(429, 'Rate limit exceeded', 'RATE_LIMIT', { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Enhanced Circuit Breaker Class
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private successfulHalfOpenRequests: number = 0;
  private config: CircuitBreakerConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private metrics: {
    totalRequests: number;
    failedRequests: number;
    successRate: number;
  };

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = {
      totalRequests: 0,
      failedRequests: 0,
      successRate: 100,
    };
    this.startHealthCheck();
  }

  private startHealthCheck(): void {
    if (this.config.healthCheckEndpoint) {
      this.healthCheckTimer = setInterval(() => {
        this.performHealthCheck();
      }, this.config.monitorInterval);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      if (this.state === CircuitState.OPEN) {
        const response = await axios.get(this.config.healthCheckEndpoint!);
        if (response.status === 200) {
          this.state = CircuitState.HALF_OPEN;
        }
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  isOpen(): boolean {
    if (this.state === CircuitState.FORCED_OPEN) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      }
    }
    return this.state === CircuitState.OPEN;
  }

  forceOpen(): void {
    this.state = CircuitState.FORCED_OPEN;
  }

  forceClose(): void {
    this.reset();
  }

  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  recordSuccess(): void {
    this.metrics.totalRequests++;
    this.updateSuccessRate();

    if (this.state === CircuitState.HALF_OPEN) {
      this.successfulHalfOpenRequests++;
      if (this.successfulHalfOpenRequests >= this.config.halfOpenRequests) {
        this.reset();
      }
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.updateSuccessRate();

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private updateSuccessRate(): void {
    this.metrics.successRate =
      ((this.metrics.totalRequests - this.metrics.failedRequests) / this.metrics.totalRequests) *
      100;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successfulHalfOpenRequests = 0;
  }

  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http:// 4.240.119.91   :8084/api/goodone';
const API_URL = import.meta.env.VITE_API_PREFIX || 'http:// 4.240.119.91   :8084/api/goodone';
const NODE_ENV = import.meta.env.MODE;

const constructApiUrl = (port?: number): string => {
  if (!port) return DEFAULT_API_URL;

  const url = new URL(DEFAULT_API_URL);
  url.port = port.toString();
  return url.toString();
};

const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000,
  healthCheckEndpoint: `${API_URL}/health`,
});

// Enhanced API Client configuration
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: DEFAULT_CONFIG.timeoutDuration,
});

// Enhanced retry configuration
axiosRetry(apiService, {
  retries: 3,
  retryDelay: (retryCount) => {
    const baseDelay = axiosRetry.exponentialDelay(retryCount);
    const jitter = Math.random() * 1000; // Add jitter
    return baseDelay + jitter;
  },
  retryCondition: (error: any) => {
    const shouldRetry =
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status >= 500 ||
      error.code === 'ECONNABORTED';

    if (shouldRetry) {
      console.warn(`Retrying request (${error.message})`);
    }
    return shouldRetry;
  },
});

// Enhanced error handler with better categorization
const handleRequestError = (error: any): any => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || error.message;

    // Add request ID if available
    const requestId = error.response.headers['x-request-id'];
    const errorData = { ...data, requestId };

    switch (status) {
      case 400:
        throw new ValidationError(message, errorData);
      case 401:
        // Refresh token logic could be added here
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new APIError(status, 'Unauthorized access', 'UNAUTHORIZED', errorData);
      case 429:
        const retryAfter = parseInt(error.response.headers['retry-after']) || undefined;
        throw new RateLimitError(retryAfter);
      // ... rest of status codes ...
    }
  }
  // ... rest of error handling ...
};

// Enhanced request interceptor with timeout handling
apiService.interceptors.request.use(
  async (config) => {
    if (circuitBreaker.isOpen()) {
      throw new APIError(503, 'Service temporarily unavailable', 'CIRCUIT_OPEN');
    }

    // Add request timeout handling
    const timeout = config.timeout || DEFAULT_CONFIG.timeoutDuration;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    config.signal = controller.signal;

    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Request interceptor error:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  (error) => Promise.reject(error),
);

// Enhanced response interceptor
apiService.interceptors.response.use(
  (response) => {
    circuitBreaker.recordSuccess();
    return response;
  },
  (error) => {
    if (error.response?.status >= 500 || !error.response) {
      circuitBreaker.recordFailure();
    }
    return Promise.reject(handleRequestError(error));
  },
);

// Enhanced API Service methods with better type safety and error handling
const ApiService = {
  get: async <T>(url: string, port?: number, config = {}): Promise<T> => {
    try {
      const baseURL = constructApiUrl(port);
      console.log(baseURL);
      const response = await apiService.get<T>(url, { ...config, baseURL });
      return response.data;
    } catch (error) {
      throw handleRequestError(error);
    }
  },

  post: async <T>(url: string, data?: any, port?: number, config = {}): Promise<T> => {
    try {
      const baseURL = constructApiUrl(port);
      const response = await apiService.post<T>(url, data, { ...config, baseURL });
      return response.data;
    } catch (error) {
      throw handleRequestError(error);
    }
  },

  delete: async <T>(url: string, port?: number, config = {}): Promise<T> => {
    try {
      const baseURL = constructApiUrl(port);
      const response = await apiService.delete<T>(url, { ...config, baseURL });
      return response.data;
    } catch (error) {
      throw handleRequestError(error);
    }
  },

  put: async <T>(url: string, data?: any, port?: number, config = {}): Promise<T> => {
    try {
      const baseURL = constructApiUrl(port);
      const response = await apiService.put<T>(url, data, { ...config, baseURL });
      return response.data;
    } catch (error) {
      throw handleRequestError(error);
    }
  },

  patch: async <T>(url: string, port?: number, data?: any, config = {}): Promise<T> => {
    try {
      const baseURL = constructApiUrl(port);
      const response = await apiService.patch<T>(url, data, { ...config, baseURL });
      return response.data;
    } catch (error) {
      throw handleRequestError(error);
    }
  },
};

// Enhanced error logging service
const logError = (error: APIError) => {
  const errorDetails = {
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
    data: error.data,
    timestamp: new Date().toISOString(),
    url: error.data?.url,
    requestId: error.data?.requestId,
    stack: error.stack,
    // Add user context if available
    userContext: {
      userId: localStorage.getItem('userId'),
      environment: NODE_ENV,
    },
  };

  console.error('API Error:', errorDetails);

  // Rate limit error logging
  if (error instanceof RateLimitError) {
    console.warn(`Rate limit exceeded. Retry after: ${error.data?.retryAfter}s`);
  }

  // You could send this to your error tracking service
  // if (process.env.REACT_APP_SENTRY_DSN) {
  //     Sentry.captureException(error, { extra: errorDetails });
  // }
};

// Example usage with enhanced error handling
const makeApiRequest = async <T>(requestFn: () => Promise<T>): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (error instanceof APIError) {
      logError(error);

      switch (error.code) {
        case 'RATE_LIMIT':
          // Implement retry with exponential backoff
          if (error instanceof RateLimitError && error.data?.retryAfter) {
            await new Promise((resolve) => setTimeout(resolve, error.data.retryAfter * 1000));
            return makeApiRequest(requestFn);
          }
          break;
        case 'NETWORK_ERROR':
          // Implement network error retry strategy
          break;
        case 'VALIDATION_ERROR':
          // Handle validation errors (e.g., show form errors)
          break;
      }
    }
    throw error; // Re-throw if unhandled
  }
};

export const { get, post, put, delete: destroy, patch } = ApiService;
export { APIError, NetworkError, TimeoutError };
export default ApiService;

// Example usage
// const fetchData = async () => {
//     return makeApiRequest(async () => {
//         const data = await ApiService.get<YourDataType>('/your-endpoint');
//         return data;
//     });
// };
