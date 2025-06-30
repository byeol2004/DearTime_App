import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView, 
  Image, 
} from 'react-native';


import { SafeAreaView } from 'react-native-safe-area-context'; 


import CandyJarSVG from '../components/CandyJarSVG'; 

import { useNavigation, useFocusEffect } from '@react-navigation/native';


import {
  getJoyfulMemoriesFromFirestore,

} from '../src/firestoreService';
import FloatingFAB from '../components/FloatingFAB';


const JOYFUL_MOODS = ['happy', 'grateful']; 

export default function JoyJarScreen() {
  const navigation = useNavigation();

  const [joyfulMemories, setJoyfulMemories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 



  const [randomMemory, setRandomMemory] = useState(null);
  const [isShaking, setIsShaking] = useState(false); 


  const fetchJoyfulMemories = async () => {
    console.log('fetchJoyfulMemories: Starting fetch...');
    setIsLoading(true); 
    try {
 
      const memories = await getJoyfulMemoriesFromFirestore(JOYFUL_MOODS);
      console.log('fetchJoyfulMemories: Fetched data:', memories);
      setJoyfulMemories(memories); 
      console.log(`fetchJoyfulMemories: Joyful memory list state updated with ${memories.length} memories.`);
    } catch (error) {
      console.error('fetchJoyfulMemories: Failed to fetch joyful memories:', error);
      Alert.alert('Error', error.message || 'Failed to load joyful memories.');
    } finally {
      setIsLoading(false);
      console.log('fetchJoyfulMemories: Loading state set to false.');
    }
  };


  useFocusEffect(
    useCallback(() => {
      console.log('useFocusEffect: Joy Jar screen focused or mounted, calling fetchJoyfulMemories.');
      fetchJoyfulMemories();
    }, []) 
  );


   const handleShakeJar = () => {
       if (isShaking || joyfulMemories.length === 0) {
           console.log('Cannot shake: Already shaking or no joyful memories.');
           if (joyfulMemories.length === 0) {
                Alert.alert('Jar is Empty!', 'Add some joyful memories or memories tagged "happy"!');
           }
           return;
       }

       setIsShaking(true); 
       setRandomMemory(null); 

       setTimeout(() => {
        
           const randomIndex = Math.floor(Math.random() * joyfulMemories.length);
           const selectedMemory = joyfulMemories[randomIndex];
           setRandomMemory(selectedMemory); 
           setIsShaking(false); 
           console.log('Shaking complete. Revealed memory:', selectedMemory);
       }, 1000); 
   };



  const renderMemoryItem = ({ item }) => (
    <View style={styles.memoryItem}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.memoryImage} />
      )}
      <View style={styles.memoryTextContent}>
         <Text style={styles.memoryText}>{item.text}</Text>
        
          {item.date && typeof item.date.toDate === 'function' && (
              <Text style={styles.memoryMeta}>{item.date.toDate().toLocaleDateString()}</Text>
          )}
           {item.moodTag && (
              <Text style={styles.memoryMeta}>Mood: {item.moodTag}</Text>
          )}
           {item.location && (
              <Text style={styles.memoryMeta}>📍 {item.location}</Text>
          )}
      </View>
      
    </View>
  );

  return (

    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}> 
          <View style={styles.crystalHeaderContainer}>
            <Text style={styles.crystalHeaderText}>
              Your <Text style={styles.crystalHeaderAccent}>Joy Crystal Ball</Text>
            </Text>
          </View>


          <View style={styles.jarWrapper}>
     
            <CandyJarSVG />
          
            <View style={styles.starsOverlay}>
              {!isLoading && joyfulMemories.map((memory, index) => (
              
                 <Text key={memory.id} style={styles.starDot}>★</Text>
              ))}
            </View>
          </View>

        
           {isLoading && (
                <View style={styles.loadingOverlay} pointerEvents="none">
                    <ActivityIndicator size="large" color="#ffda79" /> {/* Match star color */}
                </View>
           )}

   
          <TouchableOpacity
            style={styles.shakeButton}
            onPress={handleShakeJar}
            disabled={isLoading || isShaking || joyfulMemories.length === 0} 
          >
            {isShaking ? (
                 <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Text style={styles.shakeButtonText}>
                    {joyfulMemories.length === 0 ? 'Jar is Empty' : 'Shake the Crystal Ball!'}
                </Text>
            )}
          </TouchableOpacity>

       
           {randomMemory && (
               <View style={styles.randomMemoryContainer}>
                    <Text style={styles.randomMemoryTitle}>A Moment of Joy:</Text>
                   <View style={styles.memoryItem}> 
                       {randomMemory.imageUrl && (
                         <Image source={{ uri: randomMemory.imageUrl }} style={styles.memoryImage} />
                       )}
                       <View style={styles.memoryTextContent}>
                            <Text style={styles.memoryText}>{randomMemory.text}</Text>
                             {randomMemory.date && typeof randomMemory.date.toDate === 'function' && (
                                  <Text style={styles.memoryMeta}>{randomMemory.date.toDate().toLocaleDateString()}</Text>
                              )}
                               {randomMemory.moodTag && (
                                  <Text style={styles.memoryMeta}>Mood: {randomMemory.moodTag}</Text>
                              )}
                               {randomMemory.location && (
                                  <Text style={styles.memoryMeta}>📍 {randomMemory.location}</Text>
                              )}
                        </View>
                   </View>
               </View>
           )}



          <TouchableOpacity
            style={styles.openModalButton}
            onPress={() => setModalVisible(true)}
             disabled={isLoading || isShaking} 
          >
            <Text style={styles.openModalText}>View All Joyful Memories ({joyfulMemories.length})</Text> 
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>All Joyful Memories</Text>
               {isLoading ? (
                    <View style={styles.modalLoading}>
                        <ActivityIndicator size="large" color="#ffda79" />
                        <Text>Loading joyful memories...</Text>
                    </View>
               ) : joyfulMemories.length === 0 ? (
                   <View style={styles.emptyListContainer}>
                       <Text style={styles.emptyListText}>No joyful memories added yet. Add some!</Text>
                   </View>
               ) : (
                  <FlatList
                    data={joyfulMemories}
                    keyExtractor={(item) => item.id} 
                    renderItem={renderMemoryItem} 
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
               )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                 disabled={isShaking} 
              >
                <Text style={styles.closeButtonText}>Close List</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
        <FloatingFAB /> 
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0faff' }, 
  scrollViewContent: {
      padding: 20,
      paddingTop: 60, 
      alignItems: 'center', 
  },
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
    top: 20, 
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
         top: 20, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)', 
        zIndex: 2, 
   },

  shakeButton: {
    backgroundColor: '#ccd5ae', 
    padding: 15,
    borderRadius: 25,
    width: '80%', 
    alignItems: 'center',
    marginTop: 30, 
    marginBottom: 20, 
    shadowColor: '#ffda79',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
     opacity: 1, 
  },
   shakeButtonText: {
       color: '#fff',
       fontSize: 18,
       fontWeight: 'bold',
   },
   randomMemoryContainer: {
       marginTop: 20,
       marginBottom: 20,
       width: '100%',
       alignItems: 'center',
   },
   randomMemoryTitle: {
       fontSize: 20,
       fontWeight: 'bold',
       marginBottom: 10,
       color: '#555',
   },

  openModalButton: {
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
   openModalText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

   navigateButton: { 
    backgroundColor: '#87c0cd', 
    padding: 12,
    marginTop: 15,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
     elevation: 2,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.2,
     shadowRadius: 2,
      opacity: 1,
   },
   navigateText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },


  modalContainer: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f0faff' }, // Match app background
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
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#7ed6df', textAlign: 'center' },
  memoryItem: { 
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10, 
    borderWidth: 1,
    borderColor: '#d0f0f7',
    elevation: 2,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 1,
     flexDirection: 'row', 
     alignItems: 'center', 
  },
   memoryImage: { 
       width: 80, 
       height: 80, 
       borderRadius: 8,
       marginRight: 15, 
       resizeMode: 'cover',
   },
   memoryTextContent: {
       flex: 1, 
   },
  memoryText: { fontSize: 16, color: '#333' },
   memoryMeta: { 
       fontSize: 12,
       color: '#777',
       marginTop: 4,
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
   closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  
   buttonDisabled: {
       opacity: 0.5,
   },

});