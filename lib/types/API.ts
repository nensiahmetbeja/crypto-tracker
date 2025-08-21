
export interface CoinGeckoResponse {
    id: string;                           // "bitcoin"
    symbol: string;                       // "btc"
    name: string;                         // "Bitcoin"
    current_price: number;                // 45000.123
    price_change_percentage_24h: number;  // 2.34
  }
  
  /**
   * Simple error type for API failures
   */
  export interface ApiError {
    message: string;
    status?: number;
  }
  
  /**
   * HTTP response wrapper
   */
  export interface ApiResponse<T> {
    data: T;
    ok: boolean;
    status: number;
  }
  
  /**
   * Type guard to check if response is an error
   */
  export function isApiError(response: unknown): response is { error: string } {
    return (
      typeof response === 'object' &&
      response !== null &&
      'error' in response
    );
  }