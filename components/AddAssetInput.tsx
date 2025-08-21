// components/AddAssetInput.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  ActivityIndicator 
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { cryptoService, SearchResult } from '@/lib/services/CryptoService';

interface AddAssetInputProps {
  onAdd: (id: string, name?: string) => void;
  disabled?: boolean;
}

export const AddAssetInput: React.FC<AddAssetInputProps> = ({ 
  onAdd, 
  disabled = false 
}) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedInput, setDebouncedInput] = useState('');
  const debounceTimeoutRef = useRef<number | undefined>(undefined);

  // Debounced search input - reduces API calls
  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedInput(text);
      setShowSuggestions(text.length >= 2);
    }, 300) as number; // 300ms debounce delay
  }, []);

  // Search query - only search if debounced input has 2+ characters
  const searchQuery = useQuery({
    queryKey: ['crypto-search', debouncedInput],
    queryFn: () => cryptoService.searchCoins(debouncedInput),
    enabled: debouncedInput.length >= 2 && showSuggestions,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes 
    retry: 1, // Retry once for faster failure
  });

  const handleSelectCoin = useCallback((coin: SearchResult) => {
    onAdd(coin.id, coin.name);
    setInput('');
    setDebouncedInput('');
    setShowSuggestions(false);
  }, [onAdd]);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const handleFocus = useCallback(() => {
    if (input.length >= 2) {
      setShowSuggestions(true);
    }
  }, [input.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const suggestions = searchQuery.data || [];
  const isSearching = searchQuery.isFetching;
  const hasError = searchQuery.error;

  const handleManualAdd = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && suggestions.length > 0) {
      // Only allow manual add if there are suggestions available
      // This prevents random text from being added
      onAdd(trimmed);
      setInput('');
      setDebouncedInput('');
      setShowSuggestions(false);
    }
  }, [input, onAdd, suggestions.length]);

  const renderSuggestion = ({ item }: { item: SearchResult }) => (
    <Pressable
      style={({ pressed }) => [
        styles.suggestion,
        pressed && styles.suggestionPressed,
      ]}
      onPress={() => handleSelectCoin(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionSymbol}>{item.symbol}</Text>
        <Text style={styles.suggestionName}>{item.name}</Text>
        {item.market_cap_rank && (
          <Text style={styles.suggestionRank}>#{item.market_cap_rank}</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            disabled && styles.inputDisabled,
            showSuggestions && suggestions.length > 0 && styles.inputWithSuggestions,
            hasError && styles.inputError,
          ]}
          placeholder="Search crypto (e.g., ethereum, btc)"
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          returnKeyType="search"
          onSubmitEditing={handleManualAdd}
        />
        
        {isSearching && (
          <ActivityIndicator 
            size="small" 
            color="#3b82f6" 
            style={styles.searchingIndicator}
          />
        )}
      </View>

      {/* Error state for search */}
      {hasError && debouncedInput.length >= 2 && (
        <Text style={styles.errorText}>
          {searchQuery.error?.message?.includes('429') 
            ? 'Search rate limited. Please wait a few minutes before trying again.'
            : searchQuery.error?.message?.toLowerCase().includes('network')
            ? 'Network issue. Please check your connection.'
            : 'Search failed. Please try again.'
          }
        </Text>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}        // Render fewer items initially
            maxToRenderPerBatch={10}      // Batch rendering
            windowSize={5}                // Smaller window for better performance
            removeClippedSubviews={true}  // Remove off-screen items
          />
        </View>
      )}

      {/* Manual add hint */}
      {input.length > 0 && !showSuggestions && !isSearching && (
        <Text style={styles.hint}>
          {suggestions.length > 0 
            ? `Press Enter to add "${input.trim()}" manually`
            : 'Search for a cryptocurrency to add it'
          }
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 40, // Space for loading indicator
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  inputWithSuggestions: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: '#e5e7eb',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  searchingIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#d1d5db',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#ffffff',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionPressed: {
    backgroundColor: '#f3f4f6',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    minWidth: 50,
  },
  suggestionName: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginLeft: 8,
  },
  suggestionRank: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    textAlign: 'center',
  },
});