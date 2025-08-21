// lib/store/useCryptoStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { cryptoService } from '../services/CryptoService';
import { Asset, TrackedAsset } from '../types';

/**
 * Zustand store - only manages the list of tracked assets
 * React Query handles all the API calls, caching, and loading states
 */
interface CryptoStore {
  // State
  assets: Asset[];
  
  // Actions
  addAsset: (id: string) => void;
  removeAsset: (id: string) => void;
}

export const useCryptoStore = create<CryptoStore>()(
  persist(
    (set, get) => ({
      // Initial assets
      assets: [
        { id: 'btc', symbol: 'BTC' },
        { id: 'eth', symbol: 'ETH' },
        { id: 'sol', symbol: 'SOL' },
      ],

      // Add asset (with deduplication)
      addAsset: (id: string) => {
        const normalizedId = id.toLowerCase().trim();
        if (!normalizedId) return;

        const { assets } = get();
        const exists = assets.some(asset => asset.id === normalizedId);
        if (exists) return;

        const newAsset: Asset = {
          id: normalizedId,
          symbol: normalizedId.toUpperCase(),
        };

        set({ assets: [...assets, newAsset] });
      },

      // Remove asset
      removeAsset: (id: string) => {
        set(state => ({
          assets: state.assets.filter(asset => asset.id !== id.toLowerCase())
        }));
      },
    }),
    {
      name: 'crypto-assets', // AsyncStorage key
      storage: {
        getItem: (name) => AsyncStorage.getItem(name).then(str => str ? JSON.parse(str) : null),
        setItem: (name, value) => AsyncStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => AsyncStorage.removeItem(name),
      },
    }
  )
);

/**
 * React Query hook for crypto quotes
 * Automatically refetches, handles loading/error states, caches results
 */
export function useCryptoQuotes() {
  const assets = useCryptoStore(state => state.assets);
  const assetIds = assets.map(asset => asset.id);

  return useQuery({
    queryKey: ['crypto-quotes', assetIds],
    queryFn: () => cryptoService.getQuotes(assetIds),
    enabled: assetIds.length > 0,
    refetchInterval: 45000,  // Auto-refresh every 45 seconds
    staleTime: 30000,        // Consider data stale after 30 seconds
    retry: 2,                // Retry failed requests 2 times
  });
}

/**
 * Combined hook that gives you everything you need
 */
export function useCrypto() {
  const store = useCryptoStore();
  const quotesQuery = useCryptoQuotes();

  // Merge assets with their quotes
  const assetsWithQuotes: TrackedAsset[] = store.assets.map(asset => ({
    ...asset,
    quote: quotesQuery.data?.[asset.id],
  }));

  return {
    // Data
    assets: assetsWithQuotes, // TrackedAsset[]
    
    // Loading states
    isLoading: quotesQuery.isLoading,
    isRefreshing: quotesQuery.isFetching,
    error: quotesQuery.error?.message || null,
    
    // Actions
    addAsset: store.addAsset,
    removeAsset: store.removeAsset,
    refetch: quotesQuery.refetch,
  };
}