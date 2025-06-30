import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView, 
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';


import styled from 'styled-components/native'; 

import { useNavigation } from '@react-navigation/native';


import { auth } from '../src/firebaseConfig';
import { uploadImageToCloudinary } from '../src/cloudinaryService';
import { addMemoryToFirestore } from '../src/firestoreService';



export default function AddMemoryPage() {
  const navigation = useNavigation();


  const [category, setCategory] = useState('Travel');
  const [memoryText, setMemoryText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);


  const [showLocationInput, setShowLocationInput] = useState(false);
  const [location, setLocation] = useState('');


  const [showDateInput, setShowDateInput] = useState(false);
  const [selectedDateObject, setSelectedDateObject] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);


  const [selectedMood, setSelectedMood] = useState(null);



  const [isJoyful, setIsJoyful] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);



  const pickImage = async () => {
    if (isSaving) { console.log('Cannot pick image while saving.'); return; }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant media library permissions to select an image.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    } else if (!result.canceled && result.uri) {
      setSelectedImage(result.uri);
    } else {
      setSelectedImage(null);
    }
  };


   const toggleDateInputVisibility = () => {
      setShowDateInput(!showDateInput);
       if (showDateInput) { 
           setSelectedDateObject(new Date());
       }
   };

   const onDateChange = (event, date) => {
     if (event.type === 'set' || event.type === 'dismissed') {
       setShowDatePicker(false);
     }
     if (event.type === 'set' && date) {
        setSelectedDateObject(new Date(date));
     }
   };


    const toggleLocationInputVisibility = () => {
        setShowLocationInput(!showLocationInput);
         if (showLocationInput) { 
             setLocation('');
         }
    };

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Permission to access location was denied. You can manually enter location.');
          return;
        }
        setIsSaving(true);
        try {
            let locationResult = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            if (locationResult && locationResult.coords) {
                 const { latitude, longitude } = locationResult.coords;
                 let geocodeResult = await Location.reverseGeocodeAsync({ latitude, longitude });
                 if (geocodeResult && geocodeResult.length > 0) {
                      const place = geocodeResult[0];
                      const locationString = `${place.name ? place.name + ', ' : ''}${place.city || place.street || ''}, ${place.country || ''}`;
                      setLocation(locationString.trim().replace(/,$/, ''));
                 } else {
                      setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                 }
                  setShowLocationInput(true); 
            } else {
                 Alert.alert('Location Failed', 'Could not get your current location.');
            }
        } catch (error) {
            Alert.alert('Location Failed', error.message || 'Could not get your current location.');
        } finally {
             setIsSaving(false);
        }
    };

      const handleToggleJoyful = () => {
          setIsJoyful(!isJoyful);
      };


  const handleSaveMemory = async () => {
    if (isSaving) return;
    if (memoryText.trim() === '' && !selectedImage) {
      Alert.alert('Cannot Save', 'Please add some text or select an image for your memory.');
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Authentication Error', 'You must be logged in to save memories.');
      return;
    }
    setIsSaving(true);
    let imageUrl = null;
    try {
        if (selectedImage) {
           imageUrl = await uploadImageToCloudinary(selectedImage);
           if (!imageUrl) { 
             setIsSaving(false); 
             return;
           }
        }
        const savedMemoryId = await addMemoryToFirestore(
            memoryText, imageUrl, selectedMood,
            showDateInput ? selectedDateObject : null, 
            isJoyful,
            showLocationInput ? location : null 
        );
        if (savedMemoryId) {
          Alert.alert('Success', 'Memory saved successfully!');
          setMemoryText(''); setSelectedImage(null); setShowLocationInput(false);
          setShowDateInput(false); setLocation(''); setSelectedDateObject(new Date());
          setSelectedMood(null); setIsJoyful(false); setCategory('Travel'); 
        }
    } catch (error) {
      Alert.alert('Save Failed', error.message || 'Could not save your memory.');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.swiperContainer}>
        <Swiper showsPagination={true} autoplay dotColor="#A0D2DB" activeDotColor="#86C0CC">
          <ImageBackground style={styles.swiperSlide} source={require('../assets/images/bb1.jpg')} resizeMode="cover">
            <Text style={styles.swiperText}>A picture to remember.</Text>
          </ImageBackground>
          <ImageBackground style={styles.swiperSlide} source={require('../assets/images/bb2.jpg')} resizeMode="cover">
            <Text style={styles.swiperText}>Your thoughts and feelings.</Text>
          </ImageBackground>
          <ImageBackground style={styles.swiperSlide} source={require('../assets/images/bb3.jpg')} resizeMode="cover">
            <Text style={styles.swiperText}>Time and place of your memory.</Text>
          </ImageBackground>
        </Swiper>
      </View>

  
      <View style={styles.categoryOuterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollViewContentContainer}
        >
          {['Travel', 'Food', 'Date Night', 'Hangout', 'Goals', 'Romance', 'Work', 'Studies', 'Fitness', 'Hobbies', 'Family', 'Personal Growth'].map(cat => ( // Added more categories for demo
            <TouchableOpacity
              key={cat}
              onPress={() => !isSaving && setCategory(cat)}
              disabled={isSaving}
              style={[
                styles.categoryButton,
                category === cat && styles.activeCategoryButton
              ]}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.activeCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
 

      <ScrollView style={styles.memoryInputSection} contentContainerStyle={{ paddingBottom: (styles.fabContainer?.bottom || 30) + (styles.fabToggle?.height || 60) + 20 }}>
        <TextInput
          placeholder="Type your cute memory here 💭"
          multiline
          style={styles.textInput}
          value={memoryText}
          onChangeText={setMemoryText}
          placeholderTextColor="#A0D2DB"
          editable={!isSaving}
        />
         
          <TouchableOpacity onPress={handleToggleJoyful} style={[styles.joyfulToggle, isJoyful && styles.activeJoyfulToggle]} disabled={isSaving}>
             <Ionicons name={isJoyful ? "heart-circle" : "heart-circle-outline"} size={24} color={isJoyful ? "#FC6C6F" : "#86C0CC"} />
             <Text style={[styles.joyfulToggleText, isJoyful && styles.activeJoyfulToggleText]}>Add to Joy Jar</Text>
          </TouchableOpacity>

        <View style={styles.plusOptions}>
          <TouchableOpacity onPress={toggleLocationInputVisibility} style={styles.plusButton} disabled={isSaving}>
            <Ionicons name="location-outline" size={20} color="#86C0CC" />
            <Text style={styles.plusText}>Location</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleDateInputVisibility} style={styles.plusButton} disabled={isSaving}>
            <Ionicons name="calendar-outline" size={20} color="#86C0CC" />
            <Text style={styles.plusText}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={styles.plusButton} disabled={isSaving}>
            <Ionicons name="image-outline" size={20} color="#86C0CC" />
            <Text style={styles.plusText}>Image</Text>
          </TouchableOpacity>
        </View>

        {showLocationInput && (
            <View style={styles.optionalInputRow}>
                <TextInput
                  placeholder="📍 Type Location or Get Current"
                  style={[styles.optionalInput, styles.locationInput]}
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor="#A0D2DB"
                  editable={!isSaving}
                />
                 <TouchableOpacity onPress={getCurrentLocation} style={styles.getLocationButton} disabled={isSaving}>
                     <Ionicons name="navigate-circle-outline" size={24} color="#FFFFFF" />
                 </TouchableOpacity>
            </View>
        )}

        {showDateInput && (
           <View style={styles.dateInputRow}>
             <Button
                onPress={() => setShowDatePicker(true)}
                title={`Select Date: ${selectedDateObject ? selectedDateObject.toLocaleDateString() : 'No Date Selected'}`}
                 disabled={isSaving}
                 color="#86C0CC"
             />
           </View>
        )}

        {showDatePicker && (
           <DateTimePicker
             testID="datePicker"
             value={selectedDateObject || new Date()} 
             mode="date"
             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
             onChange={onDateChange}
             maximumDate={new Date()} 
           />
         )}

        {selectedImage && (
          <TouchableOpacity onPress={() => {!isSaving && setSelectedImage(null)}} disabled={isSaving} style={styles.imagePreviewContainer}>
             <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              {!isSaving && (
                  <View style={styles.clearImageButton}>
                       <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                  </View>
              )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.addButton, (isSaving || (memoryText.trim() === '' && !selectedImage)) && styles.buttonDisabled]} // Corrected disabled condition logic
          onPress={handleSaveMemory}
          disabled={isSaving || (memoryText.trim() === '' && !selectedImage)}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
             <Text style={styles.addButtonText}>💾 Save Memory</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.fabContainer}>
        {showFabMenu && (
          <>
           <TouchableOpacity
  style={styles.fabButton}
  onPress={() => { navigation.navigate('HelpSupportScreen'); setShowFabMenu(false); }}
  disabled={isSaving}
>
  <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
</TouchableOpacity>
            <TouchableOpacity
              style={styles.fabButton}
              onPress={() => { navigation.navigate('SettingScreen'); setShowFabMenu(false); }}
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
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5F7', 
  },
  swiperContainer: { height: 220 },
  swiperSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 15,
  },
  swiperText: {
    color: '#5F8E9C', 
    fontSize: 18,
    padding: 10,
    borderRadius: 10,
    fontWeight: '600',
   
  },


  categoryOuterContainer: {
    marginVertical: 15,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 15,
 
  },
  categoryScrollViewContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5, 
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 5,      
    borderWidth: 1,
    borderColor: '#E0E0E0',  
    backgroundColor: 'transparent',
  },
  activeCategoryButton: {
    backgroundColor: '#86C0CC',
    borderColor: '#86C0CC',
  },
  categoryText: {
    color: '#70A7B3',
    fontSize: 14,
  },
  activeCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },


  memoryInputSection: {
    paddingHorizontal: 20,
  
  },
  textInput: {
    borderColor: '#B0D9E1', 
    borderWidth: 1.5,
    borderRadius: 15,
    padding: 15,
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    marginTop: 10,
    textAlignVertical: 'top',
    color: '#5F8E9C', 
  },
  plusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  plusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
  },
  plusText: {
    marginLeft: 5,
    color: '#70A7B3', 
    fontWeight: '600',
  },
  optionalInputRow: {
       flexDirection: 'row',
       alignItems: 'center',
       borderColor: '#B0D9E1', 
       borderWidth: 1,
       borderRadius: 15,
       marginTop: 10,
       backgroundColor: '#FFFFFF',
       paddingRight: 5, 
   },
  optionalInput: {
    padding: 12,
    fontSize: 15,
    flex: 1, 
    color: '#5F8E9C', 
  },
  locationInput: {
    
  },
   getLocationButton: {
       padding: 8, 
       backgroundColor: '#86C0CC', 
       borderRadius: 12, 
       marginLeft: 5, 
   },
   dateInputRow: {
       marginTop: 10,
   },
  imagePreviewContainer: {
      position: 'relative', 
      marginTop: 10,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    resizeMode: 'cover',
    borderColor: '#B0D9E1', 
    borderWidth: 1,
  },
   clearImageButton: {
       position: 'absolute',
       top: 5,
       right: 5,
       zIndex: 1, 
       backgroundColor: 'rgba(255, 255, 255, 0.7)', 
       borderRadius: 14, 
       padding: 2, 
   },
  addButton: {
    backgroundColor: '#86C0CC', 
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30, 
    shadowColor: '#A0BCC9', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
   buttonDisabled: {
       opacity: 0.6, 
   },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
   moodContainer: { 
       marginTop: 15,
   },
    label: {
       fontSize: 16,
       fontWeight: 'bold',
       marginBottom: 8,
       color: '#5F8E9C', 
   },
   moodButtonRow: {
       flexDirection: 'row',
       flexWrap: 'wrap', 
   },
   moodButton: {
       backgroundColor: '#FFFFFF', 
       paddingVertical: 8,
       paddingHorizontal: 12,
       borderRadius: 15,
       marginRight: 8, 
       marginBottom: 8, 
       borderColor: '#B0D9E1', 
       borderWidth: 1,
   },
   activeMoodButton: {
       backgroundColor: '#86C0CC', 
       borderColor: '#86C0CC', 
   },
   moodButtonText: {
       color: '#70A7B3', 
       fontSize: 14,
   },
   activeMoodButtonText: {
       color: '#FFFFFF',
       fontWeight: 'bold',
   },
    joyfulToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        backgroundColor: '#FFFFFF', 
        padding: 10,
        borderRadius: 15,
        borderColor: '#B0D9E1', 
        borderWidth: 1,
        justifyContent: 'center', 
    },
    activeJoyfulToggle: { 
        backgroundColor: '#FFF0F5', 
        borderColor: '#FC6C6F', 
    },
    joyfulToggleText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#70A7B3', 
        fontWeight: 'bold',
    },
    activeJoyfulToggleText: { 
        color: '#FC6C6F', 
    },
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
  }
});