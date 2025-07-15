import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5Km4Aec6JvsfRdwBfXlXr9YDCMR13w_g",
  authDomain: "behind-the-bill.firebaseapp.com",
  projectId: "behind-the-bill",
  storageBucket: "behind-the-bill.firebasestorage.app",
  messagingSenderId: "394787666284",
  appId: "1:394787666284:web:627f312d8da9e9ed3b5b49",
  measurementId: "G-91EZDZVECN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;