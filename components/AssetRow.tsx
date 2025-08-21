// components/AssetRow.tsx

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TrackedAsset } from '@/lib/types';

interface AssetRowProps {
  asset: TrackedAsset;
  onRemove: (id: string) => void;
}

export const AssetRow = memo<AssetRowProps>(({ asset, onRemove }) => {
  const handleRemove = () => onRemove(asset.id);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatPercent = (percent: number): string => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getPercentColor = (percent: number): string => {
    if (percent > 0) return '#10b981'; // green
    if (percent < 0) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.symbol}>{asset.symbol}</Text>
          
          {asset.quote ? (
            <>
              <Text style={styles.price}>
                {formatPrice(asset.quote.priceUsd)}
              </Text>
              <Text 
                style={[
                  styles.change,
                  { color: getPercentColor(asset.quote.changePercent24h) }
                ]}
              >
                {formatPercent(asset.quote.changePercent24h)}
              </Text>
            </>
          ) : (
            <Text style={styles.loading}>Loading...</Text>
          )}
        </View>

        <Pressable
          onPress={handleRemove}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removeButtonPressed
          ]}
        >
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  info: {
    flex: 1,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 2,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  loading: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  removeButtonPressed: {
    backgroundColor: '#f9fafb',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});