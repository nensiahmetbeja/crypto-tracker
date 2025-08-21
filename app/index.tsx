// app/index.tsx

import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useCrypto } from '@/lib/store/useCryptoStore';
import { AssetRow } from '@/components/AssetRow';
import { AddAssetInput } from '@/components/AddAssetInput';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { TrackedAsset } from '@/lib/types';

export default function CryptoTrackerScreen() {
  const { 
    assets,
    isLoading, 
    isRefreshing,
    error,
    addAsset,
    removeAsset,
    refetch 
  } = useCrypto();

  const renderAssetRow = ({ item }: { item: TrackedAsset }) => (
    <AssetRow asset={item} onRemove={removeAsset} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        No cryptocurrencies added yet.
      </Text>
      <Text style={styles.emptySubtext}>
        Add one using the input above.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Crypto Tracker</Text>

        {/* Add Asset Input */}
        <AddAssetInput onAdd={addAsset} disabled={isLoading} />

        {/* Error Banner */}
        {error && (
          <ErrorBanner 
            message={error} 
            onDismiss={() => refetch()} 
          />
        )}

        {/* Asset List */}
        <FlatList
          data={assets}
          renderItem={renderAssetRow}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor="#3b82f6"
            />
          }
          contentContainerStyle={[
            styles.listContent,
            assets.length === 0 && styles.listContentEmpty
          ]}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading prices...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 32,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});