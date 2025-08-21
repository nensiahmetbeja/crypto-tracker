// components/AssetRow.tsx

import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { TrackedAsset } from '@/lib/types';

interface AssetRowProps {
  asset: TrackedAsset;
  onRemove: (id: string) => void;
}

const AssetRowComponent = ({ asset, onRemove }: AssetRowProps) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleRemove = () => {
    onRemove(asset.id);
    // Close the swipeable after deletion
    swipeableRef.current?.close();
  };

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

  const renderRightActions = () => {
    return (
      <View style={styles.deleteContainer}>
        <Pressable
          onPress={handleRemove}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed
          ]}
        >
          <MaterialIcons name="delete" size={24} color="#ffffff" />
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Left side - Icon and asset info */}
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{asset.symbol.charAt(0)}</Text>
            </View>
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{asset.name || asset.symbol}</Text>
              <Text style={styles.tickerSymbol}>{asset.symbol}</Text>
            </View>
          </View>

          {/* Right side - Price and percentage */}
          <View style={styles.rightSection}>
            {asset.quote ? (
              <>
                <Text style={[
                  styles.percentageChange,
                  { color: getPercentColor(asset.quote.changePercent24h) }
                ]}>
                  {formatPercent(asset.quote.changePercent24h)}
                </Text>
                <Text style={styles.currentPrice}>
                  {formatPrice(asset.quote.priceUsd)}
                </Text>
              </>
            ) : (
              <Text style={styles.loading}>Loading...</Text>
            )}
          </View>
        </View>
      </View>
    </Swipeable>
  );
};

export const AssetRow = memo(AssetRowComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282c34', // Dark background matching the image
    borderRadius: 12,
    marginBottom: 8, // Reduced from 12 to 8 for tighter spacing
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12, // Reduced from 16 to 12 for more compact rows
    minHeight: 64, // Set minimum height to match delete button
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40, // Reduced from 48 to 40 for better proportion
    height: 40, // Reduced from 48 to 40 for better proportion
    borderRadius: 20, // Half of width/height
    backgroundColor: '#3a3f4b', // Slightly lighter than background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Reduced from 16 to 12
  },
  iconText: {
    fontSize: 18, // Reduced from 20 to 18
    fontWeight: '700',
    color: '#ffffff',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
    color: '#ffffff', // White text for asset name
    marginBottom: 2, // Reduced from 4 to 2
  },
  tickerSymbol: {
    fontSize: 13, // Reduced from 14 to 13
    color: '#9ca3af', // Light gray for ticker symbol
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginRight: 12, // Reduced from 16 to 12
  },
  percentageChange: {
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
    marginBottom: 2, // Reduced from 4 to 2
  },
  currentPrice: {
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
    color: '#ffffff', // White text for price
  },
  loading: {
    fontSize: 13, // Reduced from 14 to 13
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  deleteContainer: {
    backgroundColor: '#ef4444', // Red background for delete action
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteButtonPressed: {
    backgroundColor: '#dc2626', // Darker red when pressed
  },
});