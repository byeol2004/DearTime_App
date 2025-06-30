import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const auth = getAuth();

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
 try {
 const result = await signInWithPopup(auth, googleProvider);
 const { user } = result;
 console.log('User logged in with Google:', user);
 // Navigate to DashboardScreen
 navigation.navigate('DashboardScreen');
 } catch (error) {
 console.log('Google Sign-in error:', error);
 }
};

export default signInWithGoogle;