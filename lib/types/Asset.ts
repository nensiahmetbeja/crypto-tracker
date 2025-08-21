export interface Asset {
  id: string;       // Internal ID (btc, eth, sol)
  symbol: string;   // Display symbol (BTC, ETH, SOL)
  name?: string;    // Full name (Bitcoin, Ethereum, Solana)
}

export interface AssetQuote {
  priceUsd: number;
  changePercent24h: number;
  lastUpdated: number;
}

export interface TrackedAsset extends Asset {
  quote?: AssetQuote;
}