import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

import { getMemoryById, getMoodBoardItemById } from '../src/firestoreService'; 

const { width } = Dimensions.get('window');

const ItemDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemId, itemType, itemData: preloadedItemData } = route.params;


  const [item, setItem] = useState(preloadedItemData || null);
 
  const [isLoading, setIsLoading] = useState(!preloadedItemData);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
  
   
   
    if (item) {
        console.log("ItemDetailScreen: Data already loaded, skipping fetch.");
        return;
    }
 
    if (!itemId) {
        setError('No item ID provided for details.');
        setIsLoading(false);
        return;
    }

    setIsLoading(true); 
    setError(null);    

    try {
      let fetchedItem;
      if (itemType === 'memory') {
        fetchedItem = await getMemoryById(itemId);
      } else if (itemType === 'moodboard') {
        fetchedItem = await getMoodBoardItemById(itemId);
      } else {
        throw new Error('Unknown item type specified.');
      }

     
      if (fetchedItem.date?.toDate) { 
        fetchedItem.date = fetchedItem.date.toDate();
      }
      if (fetchedItem.createdAt?.toDate) {
        fetchedItem.createdAt = fetchedItem.createdAt.toDate();
      }

      setItem(fetchedItem); 
    } catch (e) {
      console.error(`ItemDetailScreen: Error fetching ${itemType} item ${itemId}:`, e);
      setError(e.message || `Failed to load ${itemType} details.`);
    } finally {
      setIsLoading(false); 
    }
  }, [itemId, itemType, item]);

  useEffect(() => {
    
    if (!item) { 
      fetchData();
    }
  }, [fetchData, item]); 

  const renderDetailRow = (iconName, label, value) => {

    if ((value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) && typeof value !== 'boolean' && value !== 0) {
      return null;
    }
    return (
      <View style={styles.detailRow}>
        <Ionicons name={iconName} size={22} color="#555" style={styles.detailIcon} />
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>{label}:</Text>
          <Text style={styles.detailValue}>
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#87c0cd" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="sad-outline" size={50} color="#7f8c8d" />
        <Text style={styles.infoText}>Item not found or could not be loaded.</Text>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  let imageUri = null;
  let mainContentDisplay = null;
  let screenTitle = "Details";

  if (itemType === 'memory') {
    imageUri = item.imageUrl;
    screenTitle = item.category ? `${item.category} Memory` : "Memory Details";
    mainContentDisplay = (
      <>
        {item.text ? <Text style={styles.primaryText}>{item.text}</Text> : <Text style={styles.infoText}>No text for this memory.</Text>}
        <View style={styles.detailsCard}>
          {renderDetailRow("calendar-outline", "Date", item.date?.toLocaleDateString())}
          {renderDetailRow("pricetag-outline", "Category", item.category)}
          {renderDetailRow("location-outline", "Location", item.location)}
          {renderDetailRow("happy-outline", "Mood", item.moodTag)}
          {renderDetailRow("heart-circle-outline", "In Joy Jar", item.isJoyful)}
          {/* Ensure last row doesn't have a bottom border if it's the only one or last valid one */}
          {renderDetailRow("time-outline", "Captured On", item.createdAt?.toLocaleString())}
        </View>
      </>
    );
  } else if (itemType === 'moodboard') {
    screenTitle = item.type ? `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Item` : "Mood Board Item";
    if (item.type === 'image' && typeof item.content === 'string') {
      imageUri = item.content;
    } else if (item.type === 'sticker') {
      if (typeof item.content === 'string' && item.content.startsWith('http')) {
        imageUri = item.content; // Remote sticker
      } else if (typeof item.content === 'number') { // Local sticker asset
        mainContentDisplay = <Image source={item.content} style={styles.moodBoardAsset} resizeMode="contain" />;
      } else {
         mainContentDisplay = <Text style={styles.infoText}>Sticker content not available.</Text>;
      }
    } else if (item.type === 'text') {
      mainContentDisplay = (
        <View style={[styles.moodBoardTextCard, { backgroundColor: item.color || '#e9f5f9' }]}>
          {item.emoji && <Text style={styles.moodBoardEmoji}>{item.emoji}</Text>}
          <Text style={styles.moodBoardTextContent}>{item.content}</Text>
        </View>
      );
    }

    if (!mainContentDisplay && !imageUri) {
        mainContentDisplay = <Text style={styles.infoText}>No preview available for this {item.type || 'item'}.</Text>;
    }
 
     mainContentDisplay = (
        <>
            {mainContentDisplay}
            <View style={styles.detailsCard}>
                {renderDetailRow("time-outline", "Created On", item.createdAt?.toLocaleString())}
            </View>
        </>
     )
  }


  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={28} color="#34495e" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText} numberOfLines={1}>{screenTitle}</Text>
        <View style={styles.headerButton} /> 
      </View>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="contain" />
        ) : !mainContentDisplay && itemType === 'memory' ? ( 
            <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={80} color="#bdc3c7"/>
            </View>
        ) : null
        }
        <View style={styles.contentContainer}>
            {mainContentDisplay}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8', 
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f6f8',
  },
  loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#555'
  },
  errorText: {
    marginTop: 15,
    fontSize: 17,
    color: '#c0392b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionButton: {
    marginTop: 25,
    backgroundColor: '#87c0cd',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 12 : 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
  },
  headerButton: {
    padding: 8,
    minWidth: 40, 
    alignItems: 'center',
  },
  headerTitleText: {
    flexShrink: 1, 
    textAlign: 'center',
    fontSize: 18, 
    fontWeight: '600',
    color: '#2c3e50',
    marginHorizontal: 5,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  heroImage: {
    width: width,
    height: width * 0.85, 
    backgroundColor: '#ececec'
  },
  imagePlaceholder: {
      width: width,
      height: width * 0.75,
      backgroundColor: '#e9edf0',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
  },
  contentContainer: {
    padding: 15,
  },
  primaryText: { 
    fontSize: 17,
    lineHeight: 26,
    color: '#34495e',
    marginBottom: 20,
    paddingHorizontal: 5, 
  },
  detailsCard: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5, 
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  detailRowLast: { 
      borderBottomWidth: 0,
  },
  detailIcon: {
    marginRight: 15,
    marginTop: 1, 
    color: '#8795a1',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13, 
    color: '#6c757d', 
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#343a40', 
    flexWrap: 'wrap',
  },
  moodBoardAsset: { 
    width: width * 0.7,
    height: width * 0.7,
    alignSelf: 'center',
    marginVertical: 20,
  },
  moodBoardTextCard: {
    padding: 25,
    borderRadius: 12,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  moodBoardEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  moodBoardTextContent: {
    fontSize: 19,
    textAlign: 'center',
    color: '#2c3e50',
    lineHeight: 28,
  },
});

export default ItemDetailScreen;