import React, { useState, useCallback } from 'react';
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
  Image,
  TouchableWithoutFeedback
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
import FloatingFAB from '../components/FloatingFAB';


const Colors = {
  mainTeal: '#87c0cd',
  lightTeal: '#B3E0E9',
  lighterTeal: '#D0EEF6',
  deepTeal: '#3A6073',
  darkBlue: '#22577A',
  backgroundPrimary: '#F8FAFB',
  cardBackground: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  borderLight: '#E5E7EB',
  shadowColor: '#64748B',
  errorBackground: '#FEF2F2',
  errorText: '#DC2626',
  accentBlue: '#3B82F6',
  accentPurple: '#8B5CF6',
  surfaceGlow: 'rgba(135, 192, 205, 0.08)',
};

const SectionHeader = ({ title, iconName, count }) => (
  <View style={styles.sectionHeaderContainer}>
    <View style={styles.sectionHeaderIconContainer}>
      <Ionicons name={iconName} size={24} color={Colors.mainTeal} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
    {typeof count === 'number' && (
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{count}</Text>
      </View>
    )}
  </View>
);

const EmptyState = ({ message, iconName, isFullScreen = false, isSectionEmpty = false }) => (
  <View style={isFullScreen ? styles.fullScreenEmptyStateContainer : (isSectionEmpty ? styles.sectionEmptyStateContainer : styles.emptyStateContainer)}>
    <View style={styles.emptyStateIconContainer}>
      <Ionicons name={iconName} size={isFullScreen ? 64 : (isSectionEmpty ? 32 : 48)} color={Colors.mainTeal} />
    </View>
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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
   
      <LinearGradient 
        colors={['#87c0cd', '#a8d5e0', '#c8e6ed']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/rev.png')} style={styles.logo} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>DearTime</Text>
              <Text style={styles.subtitle}>Memory Pace</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      
  
      <View style={styles.tabControlWrapper}>
        <View style={styles.segmentedControlContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'memories' && styles.tabButtonActive]}
            onPress={() => setActiveTab('memories')}
          >
            <Ionicons 
              name="images-outline" 
              size={18} 
              color={activeTab === 'memories' ? Colors.cardBackground : Colors.deepTeal} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabButtonText, activeTab === 'memories' && styles.tabButtonTextActive]}>
              Memories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'moodboards' && styles.tabButtonActive]}
            onPress={() => setActiveTab('moodboards')}
          >
            <Ionicons 
              name="color-palette-outline" 
              size={18} 
              color={activeTab === 'moodboards' ? Colors.cardBackground : Colors.deepTeal} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabButtonText, activeTab === 'moodboards' && styles.tabButtonTextActive]}>
              Mood Boards
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={() => {}}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.mainTeal}
              colors={[Colors.mainTeal]}
              progressBackgroundColor={Colors.cardBackground}
            />
          }
        >
          {error && refreshing && (
            <View style={styles.inlineErrorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.errorText} style={styles.errorIcon} />
              <Text style={styles.inlineErrorText}>Could not refresh: {error.substring(0,100)}</Text>
            </View>
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
                            title: `Board - ${snapshot.dateString || snapshot.id.slice(-4)}`,
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
      </TouchableWithoutFeedback>
      <FloatingFAB />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },

  header: {
    height: Platform.OS === 'ios' ? 180 : 160,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 40,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.5,
  },


  tabControlWrapper: {
    paddingHorizontal: 20,
    marginTop: -25,
    zIndex: 10,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: Colors.mainTeal,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.deepTeal,
    letterSpacing: 0.3,
  },
  tabButtonTextActive: {
    color: Colors.cardBackground,
  },


  scrollViewContent: {
    paddingBottom: 120,
    paddingTop: 30,
  },
  tabContent: { 
    flex: 1,
    paddingHorizontal: 8,
  },
  categorySubsection: { 
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    marginHorizontal: 12,
    marginBottom: 20,
    paddingVertical: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },


  sectionHeaderContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeaderIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: { 
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: Colors.mainTeal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countBadgeText: {
    color: Colors.cardBackground,
    fontSize: 13,
    fontWeight: '700',
  },


  inlineErrorContainer: {
    backgroundColor: Colors.errorBackground,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.errorText,
  },
  errorIcon: {
    marginRight: 12,
  },
  inlineErrorText: {
    color: Colors.errorText,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },


  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 8,
  },


  emptyStateContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    marginHorizontal: 20,
    backgroundColor: Colors.surfaceGlow,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionEmptyStateContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginTop: 20,
  },
  fullScreenEmptyStateContainer: { 
    flexGrow: 1,
    minHeight: Dimensions.get('window').height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  sectionEmptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default AlbumsPage;