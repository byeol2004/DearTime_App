import { initializeApp } from 'firebase/app'; 
import { getAuth } from 'firebase/auth';      
import { getFirestore } from 'firebase/firestore'; 




const firebaseConfig = {
  apiKey: "AIzaSyAo7syOlEvM4B0Lzv25biGOvPivOOOHsKE", 
  authDomain: "deartime-wc.firebaseapp.com", 
  projectId: "deartime-wc",
  storageBucket: "deartime-wc.firebasestorage.app", 
  messagingSenderId: "524134913085", 
  appId: "1:524134913085:web:09d4df1e1f6dbe70e54654", 
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app); 
const db = getFirestore(app); 

export { auth, db, app };

