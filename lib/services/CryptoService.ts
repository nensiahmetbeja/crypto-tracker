// lib/services/CryptoService.ts

import { CoinGeckoResponse } from '../types';

/**
 * Maps short coin IDs to CoinGecko's official IDs
 */
const COIN_ID_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum', 
  sol: 'solana',
  ada: 'cardano',
  xrp: 'ripple',
  doge: 'dogecoin',
  dot: 'polkadot',
  link: 'chainlink',
  matic: 'matic-network',
  avax: 'avalanche-2',
};


export interface AssetQuote {
  priceUsd: number;
  changePercent24h: number;
  lastUpdated: number;
}

/**
 * Search result from CoinGecko
 */
export interface SearchResult {
  id: string;           // "ethereum"
  name: string;         // "Ethereum"
  symbol: string;       // "ETH"
  market_cap_rank: number | null;
  thumb: string;        // Small image URL
}

interface CoinGeckoSearchResponse {
  coins: SearchResult[];
}

class CryptoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  /**
   * HTTP client with basic retry logic
   */
  private async fetchWithRetry(url: string, retries = 0): Promise<Response> {
    try {
      const response = await fetch(url);
      
      // If rate limited (429), retry with backoff
      if (response.status === 429 && retries < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retries);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, retries + 1);
      }
      
      return response;
    } catch (error) {
      // Network error - retry
      if (retries < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retries);
        console.log(`Network error, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Search for cryptocurrencies by name or symbol
   */
  async searchCoins(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query.trim())}`;
      const response = await this.fetchWithRetry(url);

      if (!response.ok) {
        throw new Error(`Search failed (${response.status})`);
      }

      const data: CoinGeckoSearchResponse = await response.json();
      
      // Return only top 10 results, sorted by market cap rank
      return data.coins
        .filter(coin => coin.market_cap_rank !== null)
        .sort((a, b) => (a.market_cap_rank || 999999) - (b.market_cap_rank || 999999))
        .slice(0, 10);

    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Map user input ID to CoinGecko ID
   */
  private mapToGeckoId(userInput: string): string {
    return COIN_ID_MAP[userInput.toLowerCase()] ?? userInput.toLowerCase();
  }

  /**
   * Map CoinGecko response to our internal format
   */
  private mapToAssetQuote(coinData: CoinGeckoResponse): AssetQuote {
    return {
      priceUsd: coinData.current_price,
      changePercent24h: coinData.price_change_percentage_24h ?? 0,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Fetch quotes for multiple assets
   */
  async getQuotes(assetIds: string[]): Promise<Record<string, AssetQuote>> {
    if (assetIds.length === 0) {
      return {};
    }

    try {
      // Convert user IDs to CoinGecko IDs
      const geckoIds = assetIds.map(id => this.mapToGeckoId(id));
      const idsParam = geckoIds.join(',');
      
      const url = `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(idsParam)}&price_change_percentage=24h`;

      const response = await this.fetchWithRetry(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch prices (${response.status})`);
      }

      const data: CoinGeckoResponse[] = await response.json();

      // Map responses back to user input IDs
      const result: Record<string, AssetQuote> = {};
      
      data.forEach((coin) => {
        const userInputId = assetIds.find(
          id => this.mapToGeckoId(id) === coin.id
        );
        
        if (userInputId) {
          result[userInputId] = this.mapToAssetQuote(coin);
        }
      });

      return result;

    } catch (error) {
      console.error('Crypto service error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to fetch prices: ${error.message}`
          : 'Failed to fetch prices'
      );
    }
  }

  /**
   * Get a single asset quote
   */
  async getQuote(assetId: string): Promise<AssetQuote | null> {
    const quotes = await this.getQuotes([assetId]);
    return quotes[assetId] ?? null;
  }
}

// Export singleton instance
export const cryptoService = new CryptoService();