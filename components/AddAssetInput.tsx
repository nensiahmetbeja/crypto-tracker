// components/AddAssetInput.tsx

import React, { useState, useCallback } from 'react';
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

  // Search query - only search if input has 2+ characters
  const searchQuery = useQuery({
    queryKey: ['crypto-search', input],
    queryFn: () => cryptoService.searchCoins(input),
    enabled: input.length >= 2 && showSuggestions,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    setShowSuggestions(text.length >= 2);
  }, []);

  const handleSelectCoin = useCallback((coin: SearchResult) => {
    onAdd(coin.id, coin.name);
    setInput('');
    setShowSuggestions(false);
  }, [onAdd]);

  const handleManualAdd = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInput('');
      setShowSuggestions(false);
    }
  }, [input, onAdd]);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const suggestions = searchQuery.data || [];
  const isSearching = searchQuery.isFetching;

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
          ]}
          placeholder="Search crypto (e.g., ethereum, btc)"
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={handleInputChange}
          onFocus={() => input.length >= 2 && setShowSuggestions(true)}
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

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Manual add hint */}
      {input.length > 0 && !showSuggestions && (
        <Text style={styles.hint}>
          Press Enter to add "{input}" manually
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
});