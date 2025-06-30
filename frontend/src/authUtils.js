// DT/frontend/src/authUtils.js
import { 
  updatePassword, 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently signed in');
    }


    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);
    
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Password change error:', error);
    
    let errorMessage;
    switch (error.code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Current password is incorrect';
        break;
      case 'auth/weak-password':
        errorMessage = 'New password is too weak (minimum 6 characters)';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Please log out and log back in, then try again';
        break;
      default:
        errorMessage = error.message || 'Failed to update password';
    }
    
    return { success: false, error: errorMessage };
  }
};


export const deleteUserAccount = async (password) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    const userId = user.uid;


    const credential = EmailAuthProvider.credential(
      user.email,
      password
    );

    await reauthenticateWithCredential(user, credential);

   
    await deleteAllUserDataFromFirestore(userId);


    await deleteUser(user);
    
    return { success: true, message: 'Account deleted successfully' };
  } catch (error) {
    console.error('Account deletion error:', error);
    
    let errorMessage;
    switch (error.code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Password is incorrect';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Please log out and log back in, then try again';
        break;
      default:
        errorMessage = error.message || 'Failed to delete account';
    }
    
    return { success: false, error: errorMessage };
  }
};

const deleteAllUserDataFromFirestore = async (userId) => {
  const collections = ['memories', 'wishes', 'milestones', 'mood_board_items', 'mood_boards'];

  for (const collectionName of collections) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, collectionName, docSnapshot.id)));
      });
      
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} documents from ${collectionName}`);
    } catch (error) {
      console.error(`Error deleting documents from ${collectionName}:`, error);
    }
  }
};