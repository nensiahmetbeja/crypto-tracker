
export interface CoinGeckoResponse {
    id: string;                           // "bitcoin"
    symbol: string;                       // "btc"
    name: string;                         // "Bitcoin"
    current_price: number;                // 45000.123
    price_change_percentage_24h: number;  // 2.34
  }
  
  // CoinGecko search API response
  export interface CoinGeckoSearchResult {
    id: string;           // "ethereum"
    name: string;         // "Ethereum"
    symbol: string;       // "ETH"
    market_cap_rank: number | null;
    thumb: string;        // Small image URL
  }

  export interface ApiError {
    message: string;
    status?: number;
  }
  
  export interface ApiResponse<T> {
    data: T;
    ok: boolean;
    status: number;
  }
  
  export function isApiError(response: unknown): response is { error: string } {
    return (
      typeof response === 'object' &&
      response !== null &&
      'error' in response
    );
  }