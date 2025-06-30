import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Dimensions, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ImageViewerScreen = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const route = useRoute();
  const { imageUrl } = route.params;

  if (!imageUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Image URL not provided.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.fullImage}
        resizeMode="contain"
        onError={(e) => {
          console.log('Image loading error:', e.nativeEvent?.error);
          setLoading(false);
          setErrorMsg('Failed to load image.');
        }}
        onLoadStart={() => {
          setLoading(true);
          setErrorMsg(null);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
      />
      {loading && (
        <ActivityIndicator size="large" color="#87c0cd" style={styles.activityIndicator} />
      )}
      {errorMsg && !loading && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height,
  },
  activityIndicator: {
    position: 'absolute',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
  },
});

export default ImageViewerScreen;