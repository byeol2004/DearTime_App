import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CandyJarSVG from '../components/CandyJarSVG';

import {
  addWishToFirestore,
  getWishesFromFirestore,
  updateDocumentInFirestore,
  deleteDocumentFromFirestore
} from '../src/firestoreService';

import { Ionicons } from '@expo/vector-icons';

export default function WishJarScreen() {
  const [wish, setWish] = useState('');
  const [wishList, setWishList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWish, setEditingWish] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // NEW FAB STATE - use this for your new FAB logic
  const [showFabMenu, setShowFabMenu] = useState(false);

  const navigation = useNavigation();

  const fetchWishes = async () => {
    console.log('fetchWishes: Starting fetch...');
    setIsLoading(true);
    try {
      const wishes = await getWishesFromFirestore();
      console.log('fetchWishes: Fetched data:', wishes);
      setWishList(wishes);
      console.log(`fetchWishes: Wish list state updated with ${wishes.length} wishes.`);
    } catch (error) {
      console.error('fetchWishes: Failed to fetch wishes:', error);
      Alert.alert('Error', error.message || 'Failed to load wishes.');
    } finally {
      setIsLoading(false);
      console.log('fetchWishes: Loading state set to false.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('useFocusEffect: Screen focused or mounted, calling fetchWishes.');
      fetchWishes();
    }, [])
  );

  const handleAddWish = async () => {
    if (wish.trim() === '') return;

    setIsSaving(true);

    try {
      if (editingWish) {
        console.log('handleAddWish: Updating wish:', editingWish.id);
        await updateDocumentInFirestore('wishes', editingWish.id, {
          text: wish.trim(),
        });
        Alert.alert('Success!', 'Wish updated!');
        console.log('handleAddWish: Wish updated successfully.');
      } else {
        console.log('handleAddWish: Adding new wish...');
        const newWishId = await addWishToFirestore(wish.trim());
        Alert.alert('Success!', 'Wish added to your jar!');
        console.log('handleAddWish: New wish added with ID:', newWishId);
      }

      console.log('handleAddWish: Refreshing wish list...');
      fetchWishes();

      setWish('');
      setEditingWish(null);
      Keyboard.dismiss();

    } catch (error) {
      console.error('handleAddWish: Error adding/updating wish:', error);
      Alert.alert(editingWish ? 'Update Failed' : 'Add Failed', error.message || 'Could not save wish.');
    } finally {
      setIsSaving(false);
      console.log('handleAddWish: Saving state set to false.');
    }
  };

  const handleDeleteWish = (id) => {
    Alert.alert('Delete Wish', 'Are you sure you want to delete this wish?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsSaving(true);
          try {
            console.log('handleDeleteWish: Deleting wish:', id);
            await deleteDocumentFromFirestore('wishes', id);
            Alert.alert('Success!', 'Wish deleted.');
            console.log('handleDeleteWish: Wish deleted successfully.');
            console.log('handleDeleteWish: Refreshing wish list...');
            fetchWishes();
          } catch (error) {
            console.error('handleDeleteWish: Error deleting wish:', error);
            Alert.alert('Delete Failed', error.message || 'Could not delete wish.');
          } finally {
            setIsSaving(false);
            console.log('handleDeleteWish: Saving state set to false.');
          }
        },
      },
    ]);
  };

  const handleEditWish = (item) => {
    console.log('handleEditWish: Editing wish:', item);
    setWish(item.text);
    setEditingWish(item);
  };

  const handleToggleAchieved = async (item) => {
    setIsSaving(true);
    console.log(`handleToggleAchieved: Toggling achieved status for wish: ${item.id}. Current: ${item.isAchieved}`);
    try {
      await updateDocumentInFirestore('wishes', item.id, {
        isAchieved: !item.isAchieved,
      });
      Alert.alert('Success!', item.isAchieved ? 'Wish marked as unachieved!' : 'Wish marked as achieved!');
      console.log('handleToggleAchieved: Wish status updated successfully.');
      console.log('handleToggleAchieved: Refreshing wish list...');
      fetchWishes();
    } catch (error) {
      console.error('handleToggleAchieved: Error toggling wish status:', error);
      Alert.alert('Update Failed', error.message || 'Could not update wish status.');
    } finally {
      setIsSaving(false);
      console.log('handleToggleAchieved: Saving state set to false.');
    }
  };

  const renderWishItem = ({ item }) => {
    console.log('renderWishItem: Rendering item:', item);
    return (
      <View style={styles.wishItem}>
        <Text
          style={[
            styles.wishText,
            item.isAchieved === true && styles.achievedWish,
          ]}
        >
          {item.text}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEditWish(item)}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteWish(item.id)}>
            <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleToggleAchieved(item)}>
            <Text style={styles.actionText}>
              {item.isAchieved ? 'Undo' : 'Achieved'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
<View style={styles.crystalHeaderContainer}>
  <Text style={styles.crystalHeaderText}>
    Wish <Text style={styles.crystalHeaderAccent}>Crystal Ball</Text>
  </Text>
</View>

          <View style={styles.jarWrapper}>
            <CandyJarSVG />
            <View style={styles.starsOverlay}>
              {!isLoading && wishList.map((wish) => {
              
                const randomXOffset = (Math.random() - 0.5) * 20; 
                const randomYOffset = (Math.random() - 0.5) * 15; 
                return (
                  <Text
                    key={wish.id}
                    style={[
                      styles.starDot,
                      {
                        transform: [
                          { translateX: randomXOffset },
                          { translateY: randomYOffset }
                        ]
                      }
                    ]}
                  >
                    ★
                  </Text>
                );
              })}
            </View>
          </View>

          {isLoading && !modalVisible && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#7ed6df" />
                <Text>Loading wishes...</Text>
              </View>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              placeholder={editingWish ? "Editing wish..." : "Make a cute wish..."}
              style={styles.input}
              value={wish}
              onChangeText={setWish}
              placeholderTextColor="#555"
              editable={!isSaving}
            />
            <TouchableOpacity
              style={[styles.addButton, (isSaving || wish.trim() === '') && styles.addButtonDisabled]}
              onPress={handleAddWish}
              disabled={isSaving || wish.trim() === ''}
            >
              <Text style={styles.addText}>{isSaving ? (editingWish ? 'Updating...' : 'Adding...') : (editingWish ? 'Update' : 'Add')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.openJarButton, (isLoading || isSaving) && styles.openJarButtonDisabled]}
            onPress={() => setModalVisible(true)}
            disabled={isLoading || isSaving}
          >
            <Text style={styles.openJarText}>Open Wish Crystal Ball ({wishList.length})</Text>
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Your Magical Wishes</Text>
              {isLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color="#7ed6df" />
                  <Text>Loading wishes...</Text>
                </View>
              ) : wishList.length === 0 ? (
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>Your wish crystal ball is empty! Add some wishes.</Text>
                </View>
              ) : (
                <FlatList
                  data={wishList}
                  keyExtractor={(item) => item.id}
                  renderItem={renderWishItem}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}

              <TouchableOpacity
                style={[styles.closeButton, isSaving && styles.closeButtonDisabled]}
                onPress={() => setModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.closeButtonText}>Close Jar</Text>
              </TouchableOpacity>
            </View>
          </Modal>

     
          <View style={styles.fabContainer}>
            {showFabMenu && (
              <>
                <TouchableOpacity
                  style={styles.fabButton}
                  onPress={() => { navigation.navigate('AlbumsPage'); setShowFabMenu(false); }}
                  disabled={isSaving}
                >
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fabButton}
                  onPress={() => { navigation.navigate('SettingsScreen'); setShowFabMenu(false); }}
                  disabled={isSaving}
                >
                  <Ionicons name="settings" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fabButton}
                  onPress={() => { navigation.navigate('DashboardScreen'); setShowFabMenu(false); }}
                  disabled={isSaving}
                >
                  <Ionicons name="home" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={[styles.fabButton, styles.fabToggle]}
              onPress={() => setShowFabMenu(!showFabMenu)}
              disabled={isSaving}
            >
              <Ionicons
                name={showFabMenu ? 'close' : 'add'}
                size={30}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          {/* END NEW FAB SECTION */}

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eafcff' },
  inner: { flex: 1, padding: 20, paddingTop: 60, alignItems: 'center' },
crystalHeaderContainer: {
  marginTop: 30,
  marginBottom: 24,
  width: '100%',
  alignItems: 'flex-start', 
  paddingLeft: 4,
},
crystalHeaderText: {
  fontSize: 25,
  fontWeight: '800',
  color: '#22303c',
  letterSpacing: 2,
  // Subtle glassy/glowy background
  textShadowColor: 'rgba(36, 207, 236, 0.13)',
  textShadowOffset: { width: 0, height: 4 },
  textShadowRadius: 12,
},
crystalHeaderAccent: {
  color: '#18a3e6',
  fontWeight: '900',
  backgroundColor: 'rgba(36, 207, 236, 0.07)',
  borderRadius: 8,
  paddingHorizontal: 3,
  marginLeft: 2,
},
  jarWrapper: {
    width: 200,
    height: 300,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    top: 50,
  },
  starsOverlay: {
    position: 'absolute',
    top: 70,
    left: 30,
    right: 30,
    bottom: 50,
    zIndex: 1,
    flexDirection: 'row', 
    flexWrap: 'wrap',    
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  starDot: {
    fontSize: 18,      
    color: '#ffda79',
    margin: 3,
  
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 2,
  },
  inputRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderColor: '#7ed6df',
    borderWidth: 2,
    overflow: 'hidden',
    width: '100%',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#87c0cd',
    paddingHorizontal: 20,
    justifyContent: 'center',
    opacity: 1,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  openJarButton: {
    backgroundColor: '#7ed6df',
    padding: 14,
    marginTop: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    opacity: 1,
  },
  openJarButtonDisabled: {
    opacity: 0.5,
  },
  openJarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#eafcff' },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#7ed6df' },
  wishItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d0f0f7',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  wishText: { fontSize: 16, color: '#333' },
  achievedWish: { textDecorationLine: 'line-through', color: '#aaa', fontStyle: 'italic' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionText: {
    color: '#7ed6df',
    fontWeight: 'bold',
    marginLeft: 15,
  },
  closeButton: {
    backgroundColor: '#87c0cd',
    padding: 14,
    marginTop: 25,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    opacity: 1,
  },
  closeButtonDisabled: {
    opacity: 0.5,
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  fabContainer: {
    position: 'absolute',
    bottom: 30, 
    right: 30,  
    alignItems: 'flex-end', 
    zIndex: 10, 
  },
  fabButton: {
    backgroundColor: '#86C0CC', 
    width: 50,
    height: 50,
    borderRadius: 25, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A0BCC9', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 10, 
  },
  fabToggle: { 
    width: 60,
    height: 60,
    borderRadius: 30, 
    marginBottom: 0, 
  },


});