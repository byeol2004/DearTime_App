
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const FullScreenFeedback = ({ type, message, onRetry }) => {
  if (type === 'loading') {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#87c0cd" />
        <Text style={styles.feedbackText}>{message || 'Loading...'}</Text>
      </SafeAreaView>
    );
  }

  if (type === 'error') {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
        <Text style={[styles.feedbackText, styles.errorText]}>{message || 'An error occurred.'}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  return null; 
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0faff',
  },
  feedbackText: {
    marginTop: 15,
    fontSize: 17,
    color: '#555',
    textAlign: 'center',
  },
  errorText: {
    color: '#c0392b',
  },
  retryButton: {
    marginTop: 25,
    backgroundColor: '#87c0cd',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FullScreenFeedback;