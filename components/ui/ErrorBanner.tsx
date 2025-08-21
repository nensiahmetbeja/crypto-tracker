// components/ui/ErrorBanner.tsx

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
  showRetry?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  message, 
  onDismiss,
  showRetry = true 
}) => {
  const isRateLimited = message.includes('429') || message.toLowerCase().includes('rate limit');
  const isNetworkError = message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch');
  
  const getErrorMessage = () => {
    if (isRateLimited) {
      return 'API rate limit reached. Please wait a few minutes before retrying.';
    }
    if (isNetworkError) {
      return 'Network connection issue. Please check your internet connection.';
    }
    return message;
  };

  const getRetryText = () => {
    if (isRateLimited) {
      return 'Wait & Retry';
    }
    if (isNetworkError) {
      return 'Retry';
    }
    return 'Retry';
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.message}>{getErrorMessage()}</Text>
        
        <View style={styles.actions}>
          {showRetry && (
            <Pressable 
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed
              ]}
            >
              <Text style={styles.retryText}>{getRetryText()}</Text>
            </Pressable>
          )}
          
          <Pressable 
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed
            ]}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  message: {
    color: '#dc2626',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  retryButtonPressed: {
    backgroundColor: '#b91c1c',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
  },
  closeButtonPressed: {
    backgroundColor: '#fecaca',
  },
  closeText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});