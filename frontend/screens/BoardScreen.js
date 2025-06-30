import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  PanResponder,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TextInput,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';


import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import styled from 'styled-components/native';
import { stickerCategories } from './stickerData';
import * as ImagePicker from 'expo-image-picker';
import {
  updateDocumentInFirestore, 
  deleteDocumentInFirestore, 
  uploadImageToCloudinary, 
  getMoodBoardForDate, 
} from '../src/firestoreService';
import { auth } from '../src/firebaseConfig'; 

import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { MaterialIcons } from '@expo/vector-icons';



import ViewShot from 'react-native-view-shot';


import FloatingFAB from '../components/FloatingFAB'; 

const { width, height } = Dimensions.get('window');


const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};




const Container = styled.View`
  flex: 1;
  background-color: #f0fafa;
  padding: 20px;
  padding-bottom: 0px;
`;

const BoardInfoContainer = styled.View`
  margin-bottom: 12px;
  align-items: center;
`;

const BoardDateOnImageText = styled.Text`
  font-size: 16px;
  color: #7c9cab;
  text-align: center;
`;

const BoardTitleOnImageText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #3a6073;
  text-align: center;
`;

const BoardWrapper = styled.View`
  position: relative;
  align-items: center;
`;

const BottomButtons = styled.View`
  position: absolute;
  bottom: 30px;
  width: 110%;
`;

const ButtonCard = styled.View`
  background-color: #d8f3f2;
  padding: 15px 10px; /* Corrected space */
  border-radius: 25px;
  margin-horizontal: 10px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 4;
`;

const ButtonScroll = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    gap: 12,
    paddingHorizontal: 10,
  },
})``;

const FancyButton = styled.TouchableOpacity`
  background-color: #ffffff;
  border: 2px solid #a3d2ca;
  padding: 10px 16px; /* Corrected space */
  border-radius: 18px;
`;

const FancyText = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: #22577a;
`;

// Modal styles
const ModalBackdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
`;

const ModalContent = styled.View`
  position: absolute;
  bottom: 50px;
  left: 20px;
  right: 20px;
  background-color: #d8f3f2;
  border-radius: 20px;
  padding: 16px;
  max-height: 300px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 10px;
  elevation: 10;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #22577a;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 6px 10px; /* Corrected space */
`;

const CloseText = styled.Text`
  font-size: 20px;
  color: #22577a;
`;

const CategoryScroll = styled.ScrollView`
  flex-grow: 0;
`;

const CategoryButton = styled.TouchableOpacity`
  padding: 8px 14px; /* Corrected space */
  margin-right: 10px;
  border-radius: 14px;
  border: 1px solid #a0e7e5;
`;

const CategoryText = styled.Text`
  font-size: 14px;
  color: #22577a;
`;

const StickersScroll = styled.ScrollView`
  margin-top: 10px;
  flex-grow: 0;
`;

const StickerImage = styled.Image`
  width: 60px;
  height: 60px;
  margin-right: 10px;
`;

function DraggableItem({ item, onDragEnd, onDelete, isEditing }) { // FIX: Added isEditing prop here
  const initialPosition = item.position || { x: width / 2 - 60, y: 200 - 60 };
  const initialSize = item.size || { width: 120, height: 120 };

  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const size = useRef(new Animated.ValueXY({ x: initialSize.width, y: initialSize.height })).current;

  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);




  const handlePanSetOffset = () => {
    pan.setOffset({
      x: pan.x._value,
      y: pan.y._value,
    });
  };

  const handlePanResponderMove = Animated.event(
    [
      null,
      { dx: pan.x, dy: pan.y }
    ],
    { useNativeDriver: false }
  );

  const handlePanResponderRelease = () => {
    pan.flattenOffset();
    setIsDragging(false);
    onDragEnd(item.id, { x: pan.x._value, y: pan.y._value });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isEditing, 
      onPanResponderGrant: () => {
        setIsDragging(true);
        handlePanSetOffset();
        setShowDeleteButton(true); 
      },
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    })
  ).current;


  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setShowDeleteButton(false) },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) }
      ],
      { cancelable: true }
    );
  };

  const resizePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        size.setValue({
          x: Math.max(30, initialSize.width + gestureState.dx),
          y: Math.max(30, initialSize.height + gestureState.dy),
        });
      },
      onPanResponderRelease: () => {
        initialSize.width = size.x._value;
        initialSize.height = size.y._value;
      },
    })
  ).current;

  const renderItemContent = () => {
    switch (item.type) {
      case 'text':
        return (
          <View style={[styles.draggableTextNote, { backgroundColor: item.color || '#B5EAEA' }]}>
            {item.emoji && <Text style={styles.draggableTextEmoji}>{item.emoji}</Text>}
            <Text style={[
  styles.draggableTextContent,

  { fontSize: item.fontSize || 16, color: item.textColor || '#333' }
]}>{item.content}</Text>
          </View>
        );
      case 'image':
        return (
          <Image source={{ uri: item.content }} style={styles.draggableImage} resizeMode="cover" />
        );
      case 'sticker':
        const stickerSource = typeof item.content === 'number' ? item.content : { uri: item.content };
        return (
          <Image source={stickerSource} style={styles.draggableSticker} resizeMode="contain" />
        );
      default:
        return <Text>Unknown Item Type</Text>;
    }
  };

  return (
    <Animated.View
      style={[
        styles.draggableItem,
        {
          transform: pan.getTranslateTransform(),
          width: size.x,
          height: size.y,
          elevation: isDragging ? 10 : item.elevation || 3,
          zIndex: isDragging ? 1000 : item.zIndex || 1,
        },
      ]}
      {...panResponder.panHandlers}
    >
           {renderItemContent()}
      {isEditing && ( 
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <MaterialIcons name="close" size={28} color="red" />
        </TouchableOpacity>
      )}
      {isEditing && (
        <Animated.View
          style={styles.resizeHandle}
          {...resizePanResponder.panHandlers}
        >
          <Svg width="30" height="30" viewBox="0 0 20 20">
            <Path
              fill="rgba(0,0,0,0.2)"
              d="M10 10 L15 15 L10 20 L5 15 Z"
            />
          </Svg>
        </Animated.View>
      )}
    </Animated.View> 
  ); 
} 

export default function MoodBoard() {
  const navigation = useNavigation();

  const [boardItems, setBoardItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [currentBoardExists, setCurrentBoardExists] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTextInput, setNoteTextInput] = useState('');
  const [selectedNoteColor, setSelectedNoteColor] = useState('#B5EAEA');
  const noteColors = ['#B5EAEA', '#EDF6E5', '#E3DFFD', '#FFB5B5', '#DFCCFB'];
  
  const [isEditing, setIsEditing] = useState(false); 

  const [showStickerModal, setShowStickerModal] = useState(false);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState(stickerCategories[0]?.category || null);


  const [boardTitleInput, setBoardTitleInput] = useState('Today’s Emotions');


  const boardRef = useRef(null);

 
  const [boardBgColor, setBoardBgColor] = useState('#E0F7FA');
  const [showBgColorModal, setShowBgColorModal] = useState(false);
  const presetColors = [
  '#FDEEDC', // soft cream peach
  '#D6E5FA', // baby blue
  '#E3DFFD', // lilac
  '#FFF7D4', // light butter yellow
  '#FFB5B5', // soft pink
  '#F6DFEB', // blush lavender
  '#D1FFF3', // aqua mint
  '#B5EAEA', // teal blue
  '#EDEDED', // light grey
  '#DFCCFB', // purple pastel
  '#BBE2EC', // air blue
  '#C3EDC0', // pale mint green
  '#F9C5D1', // rose
  '#F7D6E0', // ballet pink
  '#FFFACD', // pastel lemon
];
  const [selectedNoteFontSize, setSelectedNoteFontSize] = useState(16);
  const [selectedNoteTextColor, setSelectedNoteTextColor] = useState('#333');
  const fontSizeOptions = [14, 16, 20, 24];
  const textColorOptions = ['#333', '#3a6073', '#f87171', '#a3d2ca', '#dfbbf6', '#e39898'];


  const today = new Date();
  const formattedDate = today.toDateString();
  const todayDateString = formatDateToYYYYMMDD(today); 


  const fetchBoardItems = async () => {
    console.log('fetchBoardItems: Starting fetch...');
    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Authentication Error', 'You must be logged in to view your board.');
        setIsLoading(false);
        return;
      }


      const boardSnapshotDoc = await getMoodBoardForDate(todayDateString);

      if (boardSnapshotDoc && boardSnapshotDoc.items) {
        const loadedItems = boardSnapshotDoc.items.map(item => ({
          ...item,
          id: item.id || Math.random().toString(36).substring(2, 15),
        }));
        setBoardItems(loadedItems);
        setCurrentBoardExists(true);
        setBoardTitleInput(boardSnapshotDoc.boardTitle || 'Today’s Emotions');
        console.log(`fetchBoardItems: Loaded ${loadedItems.length} items for today's board.`);
      } else {
        setBoardItems([]);
        setCurrentBoardExists(false);
        setBoardTitleInput('Today’s Emotions');
        console.log(`fetchBoardItems: No board found for today. Starting new board.`);
      }

    } catch (error) {
      console.error('fetchBoardItems: Failed to fetch board items:', error);

      setBoardItems([]); 
      setCurrentBoardExists(false);
      setBoardTitleInput('Today’s Emotions'); 
    } finally {
      setIsLoading(false);
      console.log('fetchBoardItems: Loading state set to false.');
    }
  };


 

  const addItemToBoard = async (itemData) => {
    setIsSaving(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Authentication required. Please log in.');
      }

  
      const newItemWithLocalId = { ...itemData, id: Math.random().toString(36).substring(2, 15) };
      const updatedItems = [...boardItems, newItemWithLocalId];
      setBoardItems(updatedItems);

      const serializableItemsForFirestore = updatedItems.map(item => ({
        id: item.id,
        type: item.type,
        content: item.content,
        position: item.position,
        size: item.size,
        color: item.color || null,
        emoji: item.emoji || null,
        fontSize: item.fontSize || null,
        textColor: item.textColor || null,
      }));

      const boardDocumentId = `user_${userId}_board_${todayDateString}`;
      await updateDocumentInFirestore('mood_boards', boardDocumentId, {
        userId: userId,
        dateString: todayDateString,
        items: serializableItemsForFirestore,
        lastSaved: new Date(),
        boardTitle: boardTitleInput,
        boardBgColor: boardBgColor,
      });

      setCurrentBoardExists(true); 
      console.log(`addItemToBoard: Item added and today's board updated.`);
    } catch (error) {
      console.error('addItemToBoard: Error adding item:', error);
      Alert.alert('Error', error.message || 'Could not add item.');
   
      setBoardItems(prevItems => prevItems.filter(item => item.id !== newItemWithLocalId.id));
    } finally {
      setIsSaving(false);
      console.log('addItemToBoard: Saving state set to false.');
    }
  };


  const handleButtonPress = async (type) => {
    if (isSaving || isLoading) {
      console.log('Cannot add item while saving or loading.');
      return;
    }

    const boardWidth = width - 40;
    const boardHeight = 500;
    const randomX = Math.random() * (boardWidth - 120);
    const randomY = Math.random() * (boardHeight - 120);
    const initialPosition = {
      x: randomX > 0 ? randomX : 10,
      y: randomY > 0 ? randomY : 10
    };

    switch (type) {
      case 'Note':
        setShowNoteModal(true);
        break;
      case 'Sticker':
        setShowStickerModal(true);
        if (stickerCategories.length > 0 && !selectedStickerCategory) {
          setSelectedStickerCategory(stickerCategories[0].category);
        }
        break;
      case 'Photo':
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant media library permissions to add photos.');
          return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false, 
          quality: 0.7,
          base64: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const imageUri = result.assets[0].uri;
          console.log(`Photo selected for upload: ${imageUri}`);

          setIsSaving(true); 
          try {
            const imageUrl = await uploadImageToCloudinary(imageUri);
            if (imageUrl) {
              console.log(`Photo uploaded to Cloudinary: ${imageUrl}`);
              await addItemToBoard({
                type: 'image',
                content: imageUrl,
                position: {
                  x: boardWidth / 2 - 75,
                  y: 200
                },
                size: { width: 150, height: 100 },
              });
            } else {
              console.error('Cloudinary upload failed for photo.');
              Alert.alert('Upload Failed', 'Failed to get image URL from Cloudinary.');
            }
          } catch (error) {
            console.error('Error uploading photo:', error);
            Alert.alert('Upload Failed', error.message || 'Could not upload photo.');
          } finally {
            setIsSaving(false); 
            console.log('Photo upload and save process finished.');
          }
        }
        break;
      default:
        Alert.alert(`Unknown item type: ${type}`);
    }
  };

 
  const handleSaveBoard = async () => {
    setIsSaving(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Authentication Error', 'You must be logged in to save your board.');
        setIsSaving(false);
        return;
      }

    
      const serializableBoardItems = boardItems.map(item => ({
        id: item.id,
        type: item.type,
        content: item.content,
        position: item.position,
        size: item.size,
        color: item.color || null,
        emoji: item.emoji || null,
      }));

     
      const boardDocumentId = `user_${userId}_board_${todayDateString}`;

     
      let boardImageUrl = null;
      if (boardRef.current) {
        console.log('Attempting to capture board image with ViewShot...');
        try {
          const uri = await ViewShot.captureRef(boardRef, {
            format: 'png',
            quality: 0.9,
            result: 'file',
            backgroundColor: styles.coolBoard.backgroundColor, 
          });

          if (uri) {
            boardImageUrl = await uploadImageToCloudinary(uri);
            console.log(`Mood board image uploaded to Cloudinary: ${boardImageUrl}`);
          } else {
            console.warn('Failed to capture image URI from board.');
          }
        } catch (captureError) {
          console.error('Error capturing board image with ViewShot:', captureError);
          Alert.alert('Image Capture Failed', 'Could not capture an image of your board. Ensure all elements are rendered and the view is visible.');
        }
      } else {
        console.warn('Board ref is not attached or element is not rendered yet. Cannot capture image.');
      }

  
      await updateDocumentInFirestore('mood_boards', boardDocumentId, {
        userId: userId,
        dateString: todayDateString, 
        items: serializableBoardItems,
        lastSaved: new Date(),
        boardImageUrl: boardImageUrl,
        boardTitle: boardTitleInput, 
      });

      setCurrentBoardExists(true); 
      console.log(`Mood board layout and image saved for user ${userId} for date ${todayDateString}.`);
      Alert.alert('Saved!', 'Your mood board has been successfully saved!');


      setBoardItems([]);
   
      setBoardTitleInput('Today’s Emotions');

    } catch (error) {
      console.error('Error saving mood board layout or image:', error);
      Alert.alert('Save Failed', error.message || 'Could not save your board.');
    } finally {
      setIsSaving(false);
      console.log('Mood board saving process finished.');
    }
  };



  const handleItemDragEnd = async (itemId, newPosition) => {
    console.log(`Item ${itemId} dragged to:`, newPosition);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Authentication required. Please log in.');
      }


      const updatedItems = boardItems.map(item =>
        item.id === itemId ? { ...item, position: newPosition } : item
      );
      setBoardItems(updatedItems);


      const serializableUpdatedItems = updatedItems.map(item => ({
        id: item.id,
        type: item.type,
        content: item.content,
        position: item.position,
        size: item.size,
        color: item.color || null,
        emoji: item.emoji || null,
      }));

      const boardDocumentId = `user_${userId}_board_${todayDateString}`;
      await updateDocumentInFirestore('mood_boards', boardDocumentId, {
        userId: userId,
        dateString: todayDateString,
        items: serializableUpdatedItems,
        lastSaved: new Date(),
        boardTitle: boardTitleInput, 
      });
      console.log(`Saved new position for item ${itemId} and updated today's board.`);
    } catch (error) {
      console.error(`Error saving position for item ${itemId}:`, error);
      Alert.alert('Update Failed', `Could not save item position: ${error.message}`);
     
     
    }
  };

  const handleItemDelete = async (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              const userId = auth.currentUser?.uid;
              if (!userId) {
                throw new Error('Authentication required. Please log in.');
              }

              // Update local state first
              const updatedItems = boardItems.filter(item => item.id !== itemId);
              setBoardItems(updatedItems);

            
              const serializableUpdatedItems = updatedItems.map(item => ({
                id: item.id,
                type: item.type,
                content: item.content,
                position: item.position,
                size: item.size,
                color: item.color || null,
                emoji: item.emoji || null,
              }));

              const boardDocumentId = `user_${userId}_board_${todayDateString}`;
              await updateDocumentInFirestore('mood_boards', boardDocumentId, {
                userId: userId,
                dateString: todayDateString,
                items: serializableUpdatedItems,
                lastSaved: new Date(),
                boardTitle: boardTitleInput, 
              });

              console.log(`Item ${itemId} deleted and today's board updated.`);
              Alert.alert('Deleted!', 'Item removed from board.');
            } catch (error) {
              console.error(`Error deleting item ${itemId}:`, error);
              Alert.alert('Delete Failed', error.message || 'Could not delete item.');
            
             
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddNoteFromModal = async () => {
    if (noteTextInput.trim() === '' || isSaving) {
      console.log('Cannot add empty note or while saving.');
      if (noteTextInput.trim() === '') Alert.alert('Empty Note', 'Please write something for your note.');
      return;
    }

    const boardWidth = width - 40;
    const boardHeight = 500;
    const randomX = Math.random() * (boardWidth - 120);
    const randomY = Math.random() * (boardHeight - 120);
    const initialPosition = {
      x: randomX > 0 ? randomX : 10,
      y: randomY > 0 ? randomY : 10
    };

   const noteItemData = {
  type: 'text',
  content: noteTextInput.trim(),
  position: initialPosition,
  size: { width: 120, height: 120 },
  color: selectedNoteColor,
  fontSize: selectedNoteFontSize,
  textColor: selectedNoteTextColor,
};

    await addItemToBoard(noteItemData); 

    setShowNoteModal(false);
    setNoteTextInput('');
    setSelectedNoteColor('#B5EAEA'); 
    setSelectedNoteEmoji('😊');     
  };

  const handleAddStickerFromModal = async (stickerSource) => {
    if (!stickerSource || isSaving) {
      console.log('Cannot add empty sticker or while saving.');
      return;
    }

    const boardWidth = width - 40;
    const boardHeight = 500;
    const randomX = Math.random() * (boardWidth - 60);
    const randomY = Math.random() * (boardHeight - 60);
    const initialPosition = {
      x: randomX > 0 ? randomX : 10,
      y: randomY > 0 ? randomY : 10
    };

    const stickerItemData = {
      type: 'sticker',
      content: stickerSource,
      position: initialPosition,
      size: { width: 60, height: 60 },
    };

    await addItemToBoard(stickerItemData); 

    setShowStickerModal(false);
    setSelectedNoteFontSize(16);
setSelectedNoteTextColor('#333');
  };

  const handleDeleteBoard = async () => {
    Alert.alert(
      'Delete Mood Board',
      `Are you sure you want to delete today's mood board (${formattedDate})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              const userId = auth.currentUser?.uid;
              if (!userId) {
                throw new Error('Authentication required. Please log in.');
              }
              const boardDocumentId = `user_${userId}_board_${todayDateString}`;
              await deleteDocumentInFirestore('mood_boards', boardDocumentId);

              setBoardItems([]); 
              setCurrentBoardExists(false); 
              setBoardTitleInput('Today’s Emotions');
              console.log(`Mood board for ${todayDateString} deleted.`);
              Alert.alert('Deleted!', `Your mood board for ${formattedDate} has been deleted.`);
            } catch (error) {
              console.error('Error deleting mood board:', error);
              Alert.alert('Delete Failed', error.message || 'Could not delete the mood board.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {isLoading && (
        <View style={styles.fullScreenLoadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#7ed6df" />
          <Text>Loading board...</Text>
        </View>
      )}
      {isSaving && (
        <View style={styles.fullScreenLoadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#87c0cd" />
          <Text>Saving item...</Text>
        </View>
      )}

      
<View style={styles.topButtonsContainer}>
  
  <TouchableOpacity
    onPress={() => setIsEditing(!isEditing)}
    style={styles.iconActionButton}
    disabled={isSaving || isLoading}
  >
    <MaterialIcons name={isEditing ? 'done' : 'edit'} size={20} color="#22577a" />
    <Text style={styles.iconActionText}>{isEditing ? 'Done' : 'Edit'}</Text>
  </TouchableOpacity>
 
  <TouchableOpacity
    onPress={handleDeleteBoard}
    style={styles.iconActionButton}
    disabled={isSaving || isLoading || !currentBoardExists}
  >
    <MaterialIcons name="delete" size={20} color="#C62828" />
    <Text style={[styles.iconActionText, { color: '#C62828' }]}>Delete</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={handleSaveBoard}
    style={styles.iconActionButton}
    disabled={isSaving || isLoading || boardItems.length === 0}
  >
    <MaterialIcons name="save" size={20} color="#22577a" />
    <Text style={styles.iconActionText}>Save</Text>
  </TouchableOpacity>
</View>

<TouchableOpacity
  style={{alignSelf:'flex-end', margin:5, padding:8, backgroundColor:'#87C0CD', borderRadius:15}}
  onPress={() => setShowBgColorModal(true)}
>
  <Text style={{color:'#fff', fontWeight:'bold'}}>Board Color</Text>
</TouchableOpacity>


      <ScrollView contentContainerStyle={styles.scrollViewContent}>

      
        <BoardInfoContainer>
          <TextInput
            style={styles.editableBoardTitleInput}
            value={boardTitleInput}
            onChangeText={setBoardTitleInput}
            placeholder="Enter your board title"
            placeholderTextColor="#7c9cab"
            maxLength={50}
            editable={!isLoading && !isSaving}
          />
          <Text style={styles.staticBoardDate}>{formattedDate}</Text> {/* Using standard Text component */}
        </BoardInfoContainer>


        <BoardWrapper style={{ width: '100%', height: 500 + 30 + 20 }}>
        <ViewShot ref={boardRef} style={[styles.coolBoard, { backgroundColor: boardBgColor }]}>
 
  <Svg width="100%" height="100%">
    <Rect x="0" y="0" width="100%" height="100%" fill={boardBgColor} rx="35" />
    <Path
      d="M0,400 Q150,350 300,400 T600,400 V500 H0 Z"
      fill="#87C0CD"
      opacity="0.2"
    />
  </Svg>

         
          
            <BoardDateOnImageText style={styles.boardDateOnImage}>{formattedDate}</BoardDateOnImageText>
            <BoardTitleOnImageText style={styles.boardTitleOnImage}>{boardTitleInput}</BoardTitleOnImageText>

            <View style={styles.draggableItemsLayer}>
              {!isLoading && boardItems.map(item => (
               <DraggableItem
  key={item.id}
  item={item}
  onDragEnd={handleItemDragEnd}
  onDelete={handleItemDelete}
  isEditing={isEditing}
/>
              ))}
            </View>
          </ViewShot>
        </BoardWrapper>

      </ScrollView>

      <BottomButtons>
        <ButtonCard>
          <ButtonScroll>
            <FancyButton onPress={() => handleButtonPress('Note')} disabled={isSaving || isLoading}>
              <FancyText>Note</FancyText>
            </FancyButton>
            <FancyButton onPress={() => handleButtonPress('Sticker')} disabled={isSaving || isLoading}>
              <FancyText>Sticker</FancyText>
            </FancyButton>
            <FancyButton onPress={() => handleButtonPress('Photo')} disabled={isSaving || isLoading}>
              <FancyText>Photo</FancyText>
            </FancyButton>
          </ButtonScroll>
        </ButtonCard>
      </BottomButtons>


      <Modal
        visible={showNoteModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowNoteModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => { setShowNoteModal(false); Keyboard.dismiss(); }}>
          <ModalBackdrop />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.noteModalContent}
          
        >
          <Text style={styles.modalLabel}>Font Size:</Text>
<View style={{flexDirection: 'row', marginBottom: 12}}>
  {fontSizeOptions.map(size => (
    <TouchableOpacity
      key={size}
      onPress={() => setSelectedNoteFontSize(size)}
      style={{
        marginHorizontal: 5,
        backgroundColor: selectedNoteFontSize === size ? '#87C0CD' : '#fff',
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#a3d2ca'
      }}>
      <Text style={{fontSize: size, color: '#22577a'}}>{size}</Text>
    </TouchableOpacity>
  ))}
</View>
<Text style={styles.modalLabel}>Font Color:</Text>
<View style={{flexDirection: 'row', marginBottom: 15}}>
  {textColorOptions.map(c => (
    <TouchableOpacity
      key={c}
      style={{
        width: 25, height: 25,
        borderRadius: 12.5,
        backgroundColor: c,
        marginRight: 10,
        borderWidth: selectedNoteTextColor === c ? 2 : 1,
        borderColor: selectedNoteTextColor === c ? '#22577a' : '#ccc'
      }}
      onPress={() => setSelectedNoteTextColor(c)}
    />
  ))}
</View>
          <View style={styles.noteInputContainer}>
            <Text style={styles.modalTitle}>Add a Note</Text>
            <TextInput
              placeholder="Write your note here..."
              multiline
              style={styles.noteTextInput}
              value={noteTextInput}
              onChangeText={setNoteTextInput}
              placeholderTextColor="#aaa"
              editable={!isSaving}
            />
          </View>

          <View style={styles.emojiColorPickerContainer}>
            <Text style={styles.modalLabel}>Background Color:</Text>
            <View style={styles.colorPickerRow}>
              {noteColors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }, selectedNoteColor === color && styles.selectedColorOption]}
                  onPress={() => !isSaving && setSelectedNoteColor(color)}
                  disabled={isSaving}
                />
              ))}
            </View>

        
          </View>

          <TouchableOpacity
            style={[styles.modalAddButton, isSaving && styles.buttonDisabled]}
            onPress={handleAddNoteFromModal}
            disabled={isSaving || noteTextInput.trim() === ''}
          >
            <Text style={styles.modalAddButtonText}>Add Note</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showStickerModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowStickerModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowStickerModal(false)}>
          <ModalBackdrop />
        </TouchableWithoutFeedback>

        <ModalContent>
          <ModalHeader>
            <ModalTitle>Choose Sticker</ModalTitle>
            <CloseButton onPress={() => setShowStickerModal(false)}>
              <CloseText>✕</CloseText>
            </CloseButton>
          </ModalHeader>

          <CategoryScroll
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            {stickerCategories.map((cat, index) => (
              <CategoryButton
                key={index}
                onPress={() => !isSaving && setSelectedStickerCategory(cat.category)}
                style={{
                  backgroundColor:
                    selectedStickerCategory === cat.category ? '#87C0CD' : '#fff',
                }}
                disabled={isSaving}
              >
                <CategoryText>{cat.category}</CategoryText>
              </CategoryButton>
            ))}
          </CategoryScroll>

          <StickersScroll
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0, marginTop: 12 }}
          >
            {selectedStickerCategory &&
              stickerCategories
                .find((cat) => cat.category === selectedStickerCategory)
                ?.stickers.map((sticker, idx) => (
                  <TouchableOpacity key={idx} onPress={() => !isSaving && handleAddStickerFromModal(sticker)} disabled={isSaving}>
                    <StickerImage source={sticker} resizeMode="contain" />
                  </TouchableOpacity>
                ))}
          </StickersScroll>
        </ModalContent>
      </Modal>

      <Modal
  visible={showBgColorModal}
  animationType="fade"
  transparent
  onRequestClose={() => setShowBgColorModal(false)}
>
  <TouchableWithoutFeedback onPress={() => setShowBgColorModal(false)}>
    <View style={{flex:1, backgroundColor:"rgba(0,0,0,0.35)"}}/>
  </TouchableWithoutFeedback>
  <View style={{
    position:'absolute', bottom:100, left:30, right:30,
    backgroundColor:'#d8f3f2', borderRadius:20, padding:18, alignItems:'center'
  }}>
    <Text style={{fontSize:18, fontWeight:'bold', color:'#22577a'}}>Select Board Color</Text>
 <ScrollView
  horizontal 
  showsHorizontalScrollIndicator={false} 
  contentContainerStyle={{
    paddingHorizontal: 5, 
    marginTop: 16,
    alignItems: 'center', 
    flexGrow: 1, 
    justifyContent: 'center' 
  }}
>
  {presetColors.map(c => (
    <TouchableOpacity
      key={c}
      style={{
        width:40, height:40, marginHorizontal:8, borderRadius:20,
        backgroundColor:c,
        borderWidth: boardBgColor===c ? 3 : 1,
        borderColor: boardBgColor===c ? '#22577a' : '#ccc'
      }}
      onPress={() => { setBoardBgColor(c); setShowBgColorModal(false); }}
    />
  ))}
</ScrollView>
  </View>
</Modal>
    <FloatingFAB/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f0fafa',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 150, 
    alignItems: 'center',
  },
  coolBoard: {
    width: '100%', 
    height: 500,
    backgroundColor: '#E0F7FA',
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#87C0CD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 0,
    overflow: 'hidden', 
  },
  draggableItemsLayer: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  draggableItem: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'visible', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  resizeHandle: {
    position: 'absolute',
    right: -4, 
    bottom: -4,
    width: 30, 
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggableTextNote: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  draggableTextEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  draggableTextContent: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  draggableImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  draggableSticker: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: -14, 
    right: -14,
    zIndex: 1001, 
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  fullScreenLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // Ensure it's above everything when active
  },

  noteModalContent: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#d8f3f2',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  noteInputContainer: {
    
  },

  emojiColorPickerContainer: {
    marginBottom: 15,
  },

  noteTextInput: {
    borderColor: '#a3d2ca',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    backgroundColor: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#22577a',
  },
  colorPickerRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#22577a',
  },
 
  modalAddButton: {
    backgroundColor: '#87c0cd',
    padding: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    opacity: 1,
  },
  modalAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
topButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 10,
  marginTop: Platform.OS === 'ios' ? 10 : 30,
  marginBottom: 10,
},

iconActionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  marginHorizontal: 5,
  paddingVertical: 8,
  paddingHorizontal: 8,
  borderRadius: 18,
  borderWidth: 1.5,
  borderColor: '#a3d2ca',
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOpacity: 0.07,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,
  elevation: 2,
},
iconActionText: {
  fontSize: 15,
  fontWeight: 'bold',
  color: '#22577a',
  marginLeft: 6,
},

  saveButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#a3d2ca',
    borderRadius: 18,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteBoardButton: {
    backgroundColor: '#ffebee',
    borderWidth: 2,
    borderColor: '#c62828',
    borderRadius: 18,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  boardDateOnImage: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    fontSize: 16,
    color: '#7c9cab',
    textAlign: 'center',
    zIndex: 10,
  },
  boardTitleOnImage: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a6073',
    textAlign: 'center',
    zIndex: 10,
  },

  editableBoardTitleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a6073',
    textAlign: 'center',
    width: '80%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#a3d2ca',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginTop: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
 
  staticBoardDate: {
    fontSize: 16,
    color: '#7c9cab',
    marginBottom: 12,
  },
 
});