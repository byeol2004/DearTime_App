import { db, auth } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';


import * as FileSystem from 'expo-file-system';


// Collections references
const memoriesCollection = collection(db, 'memories');
const wishesCollection = collection(db, 'wishes');
const milestonesCollection = collection(db, 'milestones');
const moodBoardItemsCollection = collection(db, 'mood_board_items'); 
const moodBoardsCollection = collection(db, 'mood_boards'); 


// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = 'df1uxcckl'; 
const CLOUDINARY_UPLOAD_PRESET = 'DT_2004'; 

/**
 * Uploads an image file from a local URI to Cloudinary.
 * Used for photos from ImagePicker AND for the ViewShot output.
 * @param {string} fileUri The local URI of the image file (e.g., 'file://...', 'ph://...')
 * @returns {Promise<string|null>}  resolves with the secure URL of the uploaded image, or null if upload fails.
 * @throws {Error} If the upload fails.
 */
export const uploadImageToCloudinary = async (fileUri) => {
    console.log('uploadImageToCloudinary: Starting upload for URI:', fileUri);
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.error('uploadImageToCloudinary: Cloudinary credentials are not set!');
        throw new Error('Cloudinary configuration missing.');
    }

    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append('file', {
        uri: fileUri,
        name: fileUri.split('/').pop(), 
        type: 'image/jpeg', 
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        const data = await response.json();

        if (response.ok) {
            console.log('uploadImageToCloudinary: Upload successful. Response data:', data);
            if (data && data.secure_url) {
                return data.secure_url;
            } else {
                 console.error('uploadImageToCloudinary: Upload succeeded but secure_url is missing in response:', data);
                 throw new Error('Upload successful, but no image URL received from Cloudinary.');
            }
        } else {
            console.error('uploadImageToCloudinary: Upload failed. Response status:', response.status);
            console.error('uploadImageToCloudinary: Response data:', data);
            const errorMessage = data?.error?.message || data?.error || `Upload failed with status ${response.status}`;
            throw new Error(`Cloudinary upload failed: ${errorMessage}`);
        }

    } catch (error) {
        console.error('uploadImageToCloudinary: Caught error during upload:', error);
        throw error;
    }
};

/**
 * Uploads a base64 image data URI to Cloudinary by first saving it to a temporary file.
 * This function is provided as a utility but might not be directly used by MoodBoard.js
 * if ViewShot directly provides a file URI.
 * @param {string} base64DataUri The base64 data URI of the image (e.g., 'data:image/png;base64,...').
 * @returns {Promise<string|null>}  resolves with the secure URL of the uploaded image, or null if upload fails.
 * @throws {Error} If the upload fails.
 */
export const uploadBase64ImageToCloudinary = async (base64DataUri) => {
    console.log('uploadBase64ImageToCloudinary: Starting upload from base64 data URI.');
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.error('uploadBase64ImageToCloudinary: Cloudinary credentials are not set!');
        throw new Error('Cloudinary configuration missing.');
    }
    if (!base64DataUri || !base64DataUri.startsWith('data:')) {
        throw new Error('Invalid base64 data URI provided.');
    }


    if (typeof FileSystem === 'undefined' || !FileSystem.documentDirectory) {
      console.error('FileSystem is not available. Please ensure expo-file-system is installed and imported.');
      throw new Error('Missing FileSystem API. Is expo-file-system installed and imported?');
    }

    const base64Content = base64DataUri.split(',')[1];
    const mimeTypeMatch = base64DataUri.match(/^data:(image\/[a-zA-Z0-9.]+);base64,/);
    let fileExtension = 'jpeg';
    if (mimeTypeMatch && mimeTypeMatch[1]) {
        fileExtension = mimeTypeMatch[1].split('/')[1] || 'jpeg';
    }

    const tempFileName = `${FileSystem.documentDirectory}mood_board_snapshot_base64_${Date.now()}.${fileExtension}`;

    try {
        await FileSystem.writeAsStringAsync(tempFileName, base64Content, {
            encoding: FileSystem.EncodingType.Base64,
        });
        console.log(`uploadBase64ImageToCloudinary: Temporary file created at ${tempFileName}`);

        const cloudinaryUrl = await uploadImageToCloudinary(tempFileName);

        await FileSystem.deleteAsync(tempFileName, { idempotent: true });
        console.log(`uploadBase64ImageToCloudinary: Temporary file deleted.`);

        return cloudinaryUrl;

    } catch (error) {
        console.error('uploadBase64ImageToCloudinary: Error during base64 image upload:', error);
        throw error;
    }
};




export const addMemoryToFirestore = async (text, imageUrl, moodTag = null, date = null, isJoyful = false, location = null, category = 'Other') => {
  const userId = auth.currentUser?.uid;
  if (!userId) { console.error('addMemoryToFirestore: No authenticated user found.'); throw new Error('Authentication required. Please log in.'); }
  if ((!text || text.trim() === '') && (!imageUrl || imageUrl.trim() === '')) { console.warn('addMemoryToFirestore: Memory must have text or an image.'); throw new Error('Please add some text or select an image for your memory.'); }
  try {
    const memoryData = {
      userId: userId,
      text: text ? text.trim() : '',
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
      moodTag: moodTag || null,
      date: date instanceof Date && !isNaN(date.getTime()) ? date : null,
      isJoyful: Boolean(isJoyful),
      location: location ? location.trim() : null,
      category: category || 'Other',
    };
    const docRef = await addDoc(memoriesCollection, memoryData);
    console.log("addMemoryToFirestore: Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) { console.error("addMemoryToFirestore: Error adding document: ", e); throw e; }
};


export const addWishToFirestore = async (text, isAchieved = false) => {
  const userId = auth.currentUser?.uid;
  if (!userId) { console.error('addWishToFirestore: No authenticated user found.'); throw new Error('Authentication required. Please log in.'); }
  if (!text || text.trim() === '') { console.warn('addWishToFirestore: Wish text cannot be empty.'); throw new Error('Wish text is required.'); }
  try {
    const wishData = { userId: userId, text: text.trim(), isAchieved: Boolean(isAchieved), createdAt: serverTimestamp(), };
    const docRef = await addDoc(wishesCollection, wishData);
    console.log("addWishToFirestore: Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) { console.error("addWishToFirestore: Error adding document: ", e); throw e; }
};

export const addMilestoneToFirestore = async (title, date, description = '') => {
  const userId = auth.currentUser?.uid;
  if (!userId) { console.error('addMilestoneToFirestore: No authenticated user found.'); throw new Error('Authentication required. Please log in.'); }
  if (!title || title.trim() === '' || !(date instanceof Date) || isNaN(date.getTime())) { console.warn('addMilestoneToFirestore: Invalid inputs provided.'); throw new Error('Valid milestone title and date are required.'); }
  if (date > new Date()) { console.warn('addMilestoneToFirestore: Milestone date cannot be in the future.'); throw new Error('Milestone date cannot be in the future.'); }
  try {
    const milestoneData = {
      userId: userId,
      title: title.trim(),
      date: date,
      description: description ? description.trim() : '',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(milestonesCollection, milestoneData);

    console.log("addMilestoneToFirestore: Document written with ID: ", docRef.id);
    return docRef.id;

  } catch (e) {
    console.error("addMilestoneToFirestore: Error caught during addDoc:", e);
    throw e;
  }
};

/**
 * Adds a new item to the mood_board_items collection for the current user.
 * (Note: This function is still here but MoodBoard.js now updates the main daily board document directly)
 * @param {object} itemData An object containing the data for the mood board item.
 * @returns {Promise<string>} A promise that resolves with the ID of the new document, or throws an error on failure.
 */
export const addMoodBoardItemToFirestore = async (itemData) => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    console.error('addMoodBoardItemToFirestore: No authenticated user found.');
    throw new Error('Authentication required. Please log in.');
  }

  if (!itemData || !itemData.type || itemData.content === undefined || itemData.position === undefined) {
      console.warn('addMoodBoardItemToFirestore: Missing required item data fields (type, content, position).', itemData);
       throw new Error('Missing required data for mood board item.');
  }

  try {
    const moodBoardDocumentData = {
      userId: userId,
      type: itemData.type,
      content: itemData.content,
      position: itemData.position,
      size: itemData.size || null,
      color: itemData.color || null,
      emoji: itemData.emoji || null,
      createdAt: serverTimestamp(), // Individual item timestamp
    };

    const docRef = await addDoc(moodBoardItemsCollection, moodBoardDocumentData);

    console.log("addMoodBoardItemToFirestore: Document written with ID: ", docRef.id);
    return docRef.id;

  } catch (e) {
    throw e;
  }
};


export const getMemoriesFromFirestore = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error('getMemoriesFromFirestore: No authenticated user found.'); return []; }
    try {
        const q = query( memoriesCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const memories = [];
        querySnapshot.forEach((doc) => { memories.push({ id: doc.id, ...doc.data() }); });
        console.log(`getMemoriesFromFirestore: Fetched ${memories.length} memories for user ${userId}`);
        return memories;
    }  catch (e) { console.error("getMemoriesFromFirestore: Error fetching documents: ", e); throw e; }
};

export const getWishesFromFirestore = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error('getWishesFromFirestore: No authenticated user found.'); return []; }
    try {
        const q = query( wishesCollection, where("userId", "==", userId), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        const wishes = [];
        querySnapshot.forEach((doc) => { wishes.push({ id: doc.id, ...doc.data() }); });
        console.log(`getWishesFromFirestore: Fetched ${wishes.length} wishes for user ${userId}`);
        return wishes;
    } catch (e) { console.error("getWishesFromFirestore: Error fetching documents: ", e); throw e; }
};

export const getMilestonesFromFirestore = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error('getMilestonesFromFirestore: No authenticated user found.'); return []; }
    try {
        const q = query( milestonesCollection, where("userId", "==", userId), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const milestones = [];
        querySnapshot.forEach((doc) => { milestones.push({ id: doc.id, ...doc.data() }); });
        console.log(`getMilestonesFromFirestore: Fetched ${milestones.length} milestones for user ${userId}`);
        return milestones;
    } catch (e) { console.error("getMilestonesFromFirestore: Error fetching documents: ", e); throw e; }
};

/**
 * Fetches memories belonging to the current user that are marked as joyful (isJoyful: true)
 * OR have a moodTag of 'happy' (or other specified joyful moods).
 * @param {string[]} [joyfulMoods=['happy']] An array of mood tags considered joyful.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of joyful memory documents.
 */
export const getJoyfulMemoriesFromFirestore = async (joyfulMoods = ['happy']) => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
        console.error('getJoyfulMemoriesFromFirestore: No authenticated user found.');
        return [];
    }

    try {
        const qJoyfulFlag = query(
            memoriesCollection,
            where("userId", "==", userId),
            where("isJoyful", "==", true)
        );
        const snapshotJoyfulFlag = await getDocs(qJoyfulFlag);
        const memoriesByFlag = snapshotJoyfulFlag.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`getJoyfulMemoriesFromFirestore: Fetched ${memoriesByFlag.length} memories by isJoyful flag.`);

        let memoriesByMood = [];
         if (joyfulMoods && joyfulMoods.length > 0) {
             if (joyfulMoods.length <= 10) { // 'in' query limit
                  const qMood = query(
                      memoriesCollection,
                      where("userId", "==", userId),
                      where("moodTag", "in", joyfulMoods)
                  );
                   const snapshotMood = await getDocs(qMood);
                   memoriesByMood = snapshotMood.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             } else {
                  console.warn('getJoyfulMemoriesFromFirestore: More than 10 joyful moods for "in" query. Consider looping or array-contains-any.');
             }
             console.log(`getJoyfulMemoriesFromFirestore: Fetched ${memoriesByMood.length} memories by mood tag.`);
         } else {
              console.log('getJoyfulMemoriesFromFirestore: No joyful moods specified for filtering.');
         }

        const combinedMemories = [...memoriesByFlag, ...memoriesByMood];
        const uniqueMemoryIds = new Set();
        const uniqueJoyfulMemories = combinedMemories.filter(memory => {
            if (uniqueMemoryIds.has(memory.id)) { return false; }
            else { uniqueMemoryIds.add(memory.id); return true; }
        });

         uniqueJoyfulMemories.sort((a, b) => {
             const dateA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(0);
             const dateB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(0);
             return dateB.getTime() - dateA.getTime();
         });

        console.log(`getJoyfulMemoriesFromFirestore: Combined and found ${uniqueJoyfulMemories.length} unique joyful memories for user ${userId}`);
        return uniqueJoyfulMemories;

    } catch (e) {
        console.error("getJoyfulMemoriesFromFirestore: Error fetching joyful memories: ", e);
        throw e;
    }
};

export const getMemoriesByMoodFromFirestore = async (mood) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { console.error('getMemoriesByMoodFromFirestore: No authenticated user found.'); return []; }
     if (!mood || mood.trim() === '') { console.warn('getMemoriesByMoodFromFirestore: No mood provided for filtering.'); return []; }
    try {
        const q = query( memoriesCollection, where("userId", "==", userId), where("moodTag", "==", mood.trim()), orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const moodMemories = [];
        querySnapshot.forEach((doc) => {
            moodMemories.push({ id: doc.id, ...doc.data() });
        });

        console.log(`getMemoriesByMoodFromFirestore: Fetched ${moodMemories.length} "${mood}" memories for user ${userId}`);
        return moodMemories;

    } catch (e) {
        console.error(`getMemoriesByMoodFromFirestore: Error fetching documents for mood "${mood}": `, e);
        throw e;
    }
};

export const getMoodBoardItemsFromFirestore = async () => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
        console.error('getMoodBoardItemsFromFirestore: No authenticated user found.');
        return [];
    }

    try {
        const q = query(
            moodBoardItemsCollection,
            where("userId", "==", userId),
            orderBy("createdAt", "asc")
        );

        const querySnapshot = await getDocs(q);

        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });

        console.log(`getMoodBoardItemsFromFirestore: Fetched ${items.length} mood board items for user ${userId}`);
        return items;

    } catch (e) {
        console.error("getMoodBoardItemsFromFirestore: Error fetching documents: ", e);
        throw e;
    }
};

/**
 * NEW FUNCTION: Fetch the mood board for a specific date for the current user.
 * @param {string} dateString The date in YYYY-MM-DD format.
 * @returns {Promise<Object|null>} A promise that resolves with the mood board document data, or null if not found.
 */
export const getMoodBoardForDate = async (dateString) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('getMoodBoardForDate: No authenticated user found.');
    return null;
  }

  const boardDocumentId = `user_${userId}_board_${dateString}`;
  const docRef = doc(moodBoardsCollection, boardDocumentId);

  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(`getMoodBoardForDate: Fetched mood board for ${dateString} for user ${userId}.`);
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log(`getMoodBoardForDate: No mood board found for ${dateString} for user ${userId}.`);
      return null;
    }
  } catch (e) {
    console.error(`getMoodBoardForDate: Error fetching mood board for ${dateString}: `, e);
    throw e;
  }
};


/**
 * NEW FUNCTION: Fetch ALL mood board snapshots for the current user (for AlbumsPage).
 * Each document represents a daily mood board.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of mood board snapshot documents.
 */
export const getAllMoodBoardSnapshots = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error('getAllMoodBoardSnapshots: No authenticated user found.');
        return [];
    }

    try {
        // Query for documents where the 'userId' field matches the current user's UID.
        // Order by 'dateString' (YYYY-MM-DD) in descending order to show most recent first.
        const q = query(
            moodBoardsCollection,
            where("userId", "==", userId),
            orderBy("dateString", "desc")
        );

        const querySnapshot = await getDocs(q);
        const boards = [];
        querySnapshot.forEach((doc) => {
            boards.push({ id: doc.id, ...doc.data() });
        });
        console.log(`getAllMoodBoardSnapshots: Fetched ${boards.length} mood board snapshots for user ${userId}`);
        return boards;

    } catch (e) {
        console.error("getAllMoodBoardSnapshots: Error fetching all mood board snapshots: ", e);
        throw e;
    }
};


// --- Fetch Single Item by ID Functions ---
export const getMemoryById = async (memoryId) => {
  if (!memoryId) {
    console.error('getMemoryById: memoryId is required.');
    throw new Error('Memory ID is required.');
  }
  try {
    const docRef = doc(db, 'memories', memoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const memoryData = docSnap.data();
      console.log(`getMemoryById: Fetched memory ${memoryId}`);
      return { id: docSnap.id, ...memoryData };
    } else {
      console.warn(`getMemoryById: No such memory document: ${memoryId}`);
      throw new Error('Memory not found.');
    }
  } catch (e) {
    console.error(`getMemoryById: Error fetching memory ${memoryId}: `, e);
    throw e;
  }
};

export const getMoodBoardItemById = async (itemId) => {
  if (!itemId) {
    console.error('getMoodBoardItemById: itemId is required.');
    throw new Error('Mood board item ID is required.');
  }
  try {
    const docRef = doc(db, 'mood_board_items', itemId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const itemData = docSnap.data();
      console.log(`getMoodBoardItemById: Fetched mood board item ${itemId}`);
      return { id: docSnap.id, ...itemData };
    } else {
      console.warn(`getMoodBoardItemById: No such mood board item document: ${itemId}`);
      throw new Error('Mood board item not found.');
    }
  } catch (e) {
    console.error(`getMoodBoardItemById: Error fetching mood board item ${itemId}: `, e);
    throw e;
  }
};


// --- Update and Delete Functions ---

/**
 * Updates a specific document in a given collection.
 * This is a generic function used by MoodBoard.js to save/update daily boards.
 * @param {string} collectionName The name of the collection ('memories', 'wishes', 'milestones', 'mood_board_items', 'mood_boards').
 * @param {string} docId The ID of the document to update or create.
 * @param {object} dataToUpdate An object containing the fields and values to update.
 * @returns {Promise<void>} A promise that resolves when the document is updated/set, or throws an error.
 */
export const updateDocumentInFirestore = async (collectionName, docId, dataToUpdate) => {
   const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('updateDocumentInFirestore: No authenticated user found.');
      throw new Error('Authentication required. Please log in.');
    }

    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, dataToUpdate, { merge: true }); // setDoc with merge creates or updates
        console.log(`updateDocumentInFirestore: Document ${docId} in ${collectionName} updated/set.`);
    } catch (e) {
         console.error(`updateDocumentInFirestore: Error updating/setting document ${docId} in ${collectionName}: `, e);
         throw e;
    }
};

/**
 * Deletes a specific document from a given collection.
 * This is a generic function used by MoodBoard.js to delete daily boards.
 * @param {string} collectionName The name of the collection ('memories', 'wishes', 'milestones', 'mood_board_items', 'mood_boards').
 * @param {string} docId The ID of the document to delete.
 * @returns {Promise<void>} A promise that resolves when the document is deleted, or throws an error.
 */
export const deleteDocumentFromFirestore = async (collectionName, docId) => {
     const userId = auth.currentUser?.uid;
    if (!userId) { console.error('deleteDocumentFromFirestore: No authenticated user found.'); throw new Error('Authentication required. Please log in.'); }

    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        console.log(`deleteDocumentFromFirestore: Document ${docId} from ${collectionName} deleted.`);
    } catch (e) {
         console.error(`deleteDocumentFromFirestore: Error deleting document ${docId} from ${collectionName}: `, e);
         throw e;
    }
};