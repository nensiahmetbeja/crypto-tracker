// components/AddAssetInput.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
    }, 300) as number; // 300ms debounce delay
  }, []);

  // Search query - only search if debounced input has 2+ characters
  const searchQuery = useQuery({
    queryKey: ['crypto-search', debouncedInput],
    queryFn: () => cryptoService.searchCoins(debouncedInput),
    enabled: debouncedInput.length >= 2,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes 
    retry: 1, // Retry once for faster failure
  });

  const handleSelectCoin = useCallback((coin: SearchResult) => {
    onAdd(coin.id, coin.name);
    setInput('');
    setDebouncedInput('');
  }, [onAdd]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const suggestions = searchQuery.data || [];

  const handleManualAdd = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && suggestions.length > 0) {
      // Only allow manual add if there are suggestions available
      // This prevents random text from being added
      onAdd(trimmed);
      setInput('');
      setDebouncedInput('');
    }
  }, [input, onAdd, suggestions.length]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            suggestions.length > 0 && styles.inputWithSuggestions,
            !disabled && styles.inputDisabled
          ]}
          placeholder="Search cryptocurrencies..."
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={handleInputChange}
          onSubmitEditing={handleManualAdd}
          editable={!disabled}
        />
        {input.length > 0 && (
          <Pressable
            onPress={() => {
              setInput('');
              setDebouncedInput('');
            }}
            style={styles.clearButton}
          >
            <MaterialIcons name="close" size={20} color="#9ca3af" />
          </Pressable>
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.suggestion,
                  pressed && styles.suggestionPressed
                ]}
                onPress={() => handleSelectCoin(item)}
              >
                <View style={styles.suggestionContent}>
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionSymbol}>{item.symbol.toUpperCase()}</Text>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                  </View>
                  <MaterialIcons name="add-circle-outline" size={20} color="#10b981" />
                </View>
              </Pressable>
            )}
            style={styles.suggestionsList}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
          />
        </View>
      )}

      {!disabled && input.length > 0 && (
        <Text style={styles.hintText}>
           Select a cryptocurrency from the suggestions above to add it to your list
        </Text>
      )}

      {searchQuery.isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {searchQuery.error?.message?.includes('429') 
              ? 'API rate limit reached. Please wait a moment before searching again.'
              : searchQuery.error?.message?.includes('Network') 
                ? 'Network connection issue. Please check your internet connection.'
                : 'Failed to search. Please try again.'}
          </Text>
        </View>
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
    borderColor: '#4b5563',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 40, // Space for loading indicator
    fontSize: 16,
    backgroundColor: '#3a3f4b', // Dark input background
    color: '#ffffff', // White text
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
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 5,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#4b5563',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#3a3f4b', // Dark suggestions background
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
    borderBottomColor: '#4b5563',
  },
  suggestionPressed: {
    backgroundColor: '#4b5563', // Dark pressed state
  },
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff', // White text for dark theme
    minWidth: 50,
  },
  suggestionName: {
    fontSize: 14,
    color: '#9ca3af', // Light gray for dark theme
    marginLeft: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
});