import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 

import { auth } from '../src/firebaseConfig';
import {
  getMemoriesFromFirestore,
  getAllMoodBoardSnapshots,
} from '../src/firestoreService';

import FullScreenFeedback from '../components/FullScreenFeedback';
import AlbumCard from '../components/AlbumCard';


const Colors = {
  mainTeal: '#87c0cd',
  lightTeal: '#B3E0E9',
  lighterTeal: '#D0EEF6',
  deepTeal: '#3A6073',
  darkBlue: '#22577A',
  backgroundPrimary: '#F0F5F9',
  cardBackground: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  borderLight: '#E0E0E0',
  shadowColor: '#A0BCC9',
  errorBackground: '#FFEBEE',
  errorText: '#C62828',
};

const SectionHeader = ({ title, iconName, count }) => (
  <View style={styles.sectionHeaderContainer}>
    <Ionicons name={iconName} size={28} color={Colors.deepTeal} style={styles.sectionHeaderIcon} />
    <Text style={styles.sectionTitle}>{title}</Text>
    {typeof count === 'number' && <Text style={styles.sectionCount}>({count})</Text>}
  </View>
);

const EmptyState = ({ message, iconName, isFullScreen = false, isSectionEmpty = false }) => (
  <View style={isFullScreen ? styles.fullScreenEmptyStateContainer : (isSectionEmpty ? styles.sectionEmptyStateContainer : styles.emptyStateContainer)}>
    <Ionicons name={iconName} size={isFullScreen ? 70 : (isSectionEmpty ? 35 : 55)} color={Colors.textLight} />
    <Text style={isSectionEmpty ? styles.sectionEmptyStateText : styles.emptyStateText}>{message}</Text>
  </View>
);

const MEMORY_CATEGORIES_ORDER = ['Travel', 'Food', 'Date Night', 'Hangout', 'Goals', 'Romance', 'Other'];


const AlbumsPage = () => {
  const navigation = useNavigation();
  const [groupedMemories, setGroupedMemories] = useState({});
  const [moodBoardSnapshots, setMoodBoardSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('memories');

  const processAndGroupMemories = (memories) => {
    const groups = {};
    MEMORY_CATEGORIES_ORDER.forEach(cat => { groups[cat] = []; });

    memories.forEach(memory => {
      const category = memory.category && MEMORY_CATEGORIES_ORDER.includes(memory.category) ? memory.category : 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(memory);
    });
    return groups;
  };

  const fetchData = async () => {
    if (!auth.currentUser) {
      setError('User not authenticated. Please log in.');
      setIsLoading(false); setRefreshing(false); return;
    }
    setError(null);

    try {
      const fetchedMemories = await getMemoriesFromFirestore();
      const processedMemories = fetchedMemories.map(mem => ({
        ...mem,
        date: mem.date?.toDate ? mem.date.toDate() : (mem.date ? new Date(mem.date) : null),
        createdAt: mem.createdAt?.toDate ? mem.createdAt.toDate() : (mem.createdAt ? new Date(mem.createdAt) : null),
      }));
      setGroupedMemories(processAndGroupMemories(processedMemories));

      const fetchedMoodBoardSnapshots = await getAllMoodBoardSnapshots();
      setMoodBoardSnapshots(fetchedMoodBoardSnapshots);

    } catch (e) {
      console.error('AlbumsPage: Error fetching data:', e);
      setError(e.message || 'Failed to fetch data.');
      if (!refreshing) { Alert.alert('Error', e.message || 'Could not load items.'); }
    } finally {
      setIsLoading(false); setRefreshing(false);
    }
  };


  useFocusEffect(useCallback(() => { setIsLoading(true); fetchData(); }, []));
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  if (isLoading && !refreshing) {
    return <FullScreenFeedback type="loading" message="Loading your albums..." />;
  }

  const noMemoriesAtAll = Object.values(groupedMemories).every(arr => arr.length === 0);
  const allItemsEmpty = noMemoriesAtAll && moodBoardSnapshots.length === 0;

  if (error && !refreshing && noMemoriesAtAll && moodBoardSnapshots.length === 0) {
    return <FullScreenFeedback type="error" message={error} onRetry={fetchData} />;
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBackground} />
      {/* Updated Header section */}
      <LinearGradient colors={['#87c0cd', '#d5e8ed']} style={styles.header}>
             <View style={styles.headerInner}>
               <Image source={require('../assets/images/rev.png')} style={styles.logo} />
               <Text style={styles.title}>DearTime</Text>
               <Text style={styles.subtitle}>Memory Pace</Text>
             </View>
      </LinearGradient>
      
      <View style={styles.segmentedControlContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'memories' && styles.tabButtonActive]}
          onPress={() => setActiveTab('memories')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'memories' && styles.tabButtonTextActive]}>
            Memories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'moodboards' && styles.tabButtonActive]}
          onPress={() => setActiveTab('moodboards')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'moodboards' && styles.tabButtonTextActive]}>
            Mood Boards
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Platform.OS === 'ios' ? Colors.mainTeal : undefined}
            colors={Platform.OS === 'android' ? [Colors.mainTeal] : undefined}
          />
        }
      >
        {error && refreshing && (
             <View style={styles.inlineErrorContainer}><Text style={styles.inlineErrorText}>Could not refresh: {error.substring(0,100)}</Text></View>
        )}

        {activeTab === 'memories' && (
          <View style={styles.tabContent}>
            {MEMORY_CATEGORIES_ORDER.map(categoryName => {
              const memoriesInCategory = groupedMemories[categoryName];
              if (memoriesInCategory && memoriesInCategory.length > 0) {
                return (
                  <View key={categoryName} style={styles.categorySubsection}>
                    <SectionHeader title={categoryName} iconName="folder-outline" count={memoriesInCategory.length} />
                    <View style={styles.gridContainer}>
                      {memoriesInCategory.map(item => (
                        <AlbumCard
                          key={`memory-${item.id}`}
                          item={item}
                          itemType="memory"
                          onPress={() => navigation.navigate('ItemDetailScreen', {
                            itemId: item.id,
                            itemType: 'memory',
                          })}
                        />
                      ))}
                    </View>
                  </View>
                );
              }
              return null;
            })}

            {noMemoriesAtAll && !isLoading && (
                <EmptyState message="No memories captured yet. Start creating your journal!" iconName="images-outline" isSectionEmpty={true} />
            )}
          </View>
        )}

        {activeTab === 'moodboards' && (
          <View style={styles.tabContent}>
            <View style={styles.categorySubsection}>
              <SectionHeader title="Your Boards" iconName="color-palette-outline" count={moodBoardSnapshots.length} />
              {moodBoardSnapshots.length > 0 ? (
                <View style={styles.gridContainer}>
                  {moodBoardSnapshots.map(snapshot => (
                    snapshot.boardImageUrl && (
                      <AlbumCard
                        key={`mood-board-${snapshot.id}`}
                        item={{
                          id: snapshot.id,
                          type: 'moodboard-snapshot',
                          content: snapshot.boardImageUrl,
                          title: `Mood Board - ${snapshot.dateString}`,
                          createdAt: snapshot.lastSaved?.toDate ? snapshot.lastSaved.toDate() : null,
                        }}
                        itemType="moodboard-snapshot"
                        onPress={() => {
                          navigation.navigate('ImageViewer', { imageUrl: snapshot.boardImageUrl });
                        }}
                      />
                    )
                  ))}
                </View>
              ) : (
                !isLoading && <EmptyState message="No mood boards saved yet. Create your first one!" iconName="leaf-outline" isSectionEmpty={true} />
              )}
            </View>
          </View>
        )}


        {allItemsEmpty && !isLoading && !error && (
            <EmptyState message="Nothing here yet. Your albums are waiting to be filled!" iconName="file-tray-stacked-outline" isFullScreen={true}/>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },

  header: {
    height: '35%', 
    borderBottomRightRadius: 80,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 20, 
    justifyContent: 'center', 
    elevation: 10,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 5 }, 
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  headerInner: {
    alignItems: 'center',
  },
  logo: {
    width: 150, 
    height: 150, 
    marginBottom: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold',
    color: '#fff', 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#fff', 
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20, 
    backgroundColor: Colors.lighterTeal,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lighterTeal,
  },
  tabButtonActive: {
    backgroundColor: Colors.mainTeal,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.deepTeal,
  },
  tabButtonTextActive: {
    color: Colors.cardBackground,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  tabContent: { 
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    paddingHorizontal: 5, 
    paddingTop: 15, 
  },
  categorySubsection: { 
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    marginHorizontal: 10, 
    marginBottom: 15, 
    paddingVertical: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inlineErrorContainer: {
      backgroundColor: Colors.errorBackground,
      padding: 15,
      borderRadius: 12,
      marginHorizontal: 10, 
      marginVertical: 15,
      borderLeftWidth: 6,
      borderLeftColor: Colors.errorText,
  },
  inlineErrorText: {
      color: Colors.errorText,
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 20,
  },
  sectionHeaderContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20, 
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeaderIcon: {
    marginRight: 10,
  },
  sectionTitle: { 
    fontSize: 20,
    fontWeight: '700',
    color: Colors.deepTeal,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 5, 
    paddingTop: 10,
    paddingBottom: 10,
  },
  emptyStateContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: 10, 
    backgroundColor: Colors.lighterTeal, 
    borderRadius: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionEmptyStateContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    marginHorizontal: 10,
    backgroundColor: 'transparent',
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 15,
  },
  fullScreenEmptyStateContainer: { 
    flexGrow: 1,
    minHeight: Dimensions.get('window').height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 30,
    backgroundColor: Colors.backgroundPrimary,
  },
  emptyStateText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  sectionEmptyStateText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default AlbumsPage;