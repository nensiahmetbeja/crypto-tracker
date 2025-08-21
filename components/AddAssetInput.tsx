// co// components/AddAssetInput.tsx

import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';

interface AddAssetInputProps {
  onAdd: (id: string) => void;
  disabled?: boolean;
}

export const AddAssetInput: React.FC<AddAssetInputProps> = ({ 
  onAdd, 
  disabled = false 
}) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInput('');
    }
  };

  const handleSubmit = () => {
    handleAdd();
  };

  const isButtonDisabled = disabled || !input.trim();

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          disabled && styles.inputDisabled
        ]}
        placeholder="Add coin (e.g., btc, eth, sol)"
        placeholderTextColor="#9ca3af"
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSubmit}
        editable={!disabled}
        returnKeyType="done"
      />
      
      <Pressable
        onPress={handleAdd}
        disabled={isButtonDisabled}
        style={({ pressed }) => [
          styles.button,
          pressed && !isButtonDisabled && styles.buttonPressed,
          isButtonDisabled && styles.buttonDisabled,
        ]}
      >
        <Text style={[
          styles.buttonText,
          isButtonDisabled && styles.buttonTextDisabled
        ]}>
          Add
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  buttonPressed: {
    backgroundColor: '#2563eb',
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: '#9ca3af',
  },
});