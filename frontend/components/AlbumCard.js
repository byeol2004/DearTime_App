

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const AlbumCard = ({ item, itemType, onPress }) => {
  let cardContent;
  let cardTitle = '';
  let cardDate = '';
  let cardImageSource = null;


  if (!item || typeof item !== 'object') {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} disabled={true}>
        <View style={styles.cardContent}>
          <View style={styles.noImageIcon}>
            <Ionicons name="alert-circle-outline" size={50} color="#e74c3c" />
            <Text style={styles.noImageText}>Error Loading Item</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>Invalid Data</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (itemType === 'memory') {
    cardTitle = item.text ? String(item.text) : 'Untitled Memory'; 
    cardImageSource = item.imageUrl ? { uri: item.imageUrl } : null;
    if (item.date && item.date.toLocaleDateString) { 
      cardDate = item.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } else if (item.createdAt && item.createdAt.toLocaleDateString) {
      cardDate = item.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    cardContent = (
      <View style={styles.cardContent}>
        {cardImageSource ? (
          <Image source={cardImageSource} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.noImageIcon}>
            <Ionicons name="image-outline" size={50} color="#bdc3c7" />
          </View>
        )}
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>{cardTitle}</Text>
          {cardDate ? <Text style={styles.cardDate}>{cardDate}</Text> : null}
        </View>
      </View>
    );

  } else if (itemType === 'moodboard-snapshot') {

    cardTitle = item.title ? String(item.title) : 'Mood Board'; 
    cardImageSource = item.content ? { uri: item.content } : null; 
    if (item.createdAt && item.createdAt.toLocaleDateString) { 
      cardDate = item.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    cardContent = (
      <View style={styles.cardContent}>
        {cardImageSource ? (
       
          <Image source={cardImageSource} style={styles.moodBoardImage} resizeMode="cover" />
        ) : (
          <View style={styles.noImageIcon}>
            <Ionicons name="color-palette-outline" size={50} color="#bdc3c7" />
            <Text style={styles.noImageText}>No Mood Board Image</Text>
          </View>
        )}
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>{cardTitle}</Text>
          {cardDate ? <Text style={styles.cardDate}>{cardDate}</Text> : null}
        </View>
      </View>
    );

  } else {

    cardTitle = (item.title || item.text) ? String(item.title || item.text) : 'Unknown Item';
    cardContent = (
      <View style={styles.cardContent}>
        <View style={styles.noImageIcon}>
          <Ionicons name="help-circle-outline" size={50} color="#bdc3c7" />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>{cardTitle}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {cardContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%', 
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', 
  },
  cardContent: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: 120, 
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  moodBoardImage: {
    width: '100%',
    height: 180, 
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  noImageIcon: {
    width: '100%',
    height: 120, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  noImageText: {
    marginTop: 5,
    fontSize: 12,
    color: '#95a5a6',
  },
  cardTextContainer: {
    padding: 10,
    minHeight: 60, 
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default AlbumCard;