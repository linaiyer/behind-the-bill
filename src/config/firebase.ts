import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';

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

// Suppress Firestore connection warnings in development
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out Firebase Firestore connection warnings
  const message = args.join(' ');
  if (message.includes('WebChannelConnection RPC') && message.includes('transport errored')) {
    return; // Suppress these warnings
  }
  originalConsoleWarn(...args);
};

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Set up a connection timeout to reduce warnings
let connectionTimeout: NodeJS.Timeout | null = null;

const initializeFirestoreConnection = async () => {
  try {
    await enableNetwork(db);
    console.log('Firestore network enabled successfully');
  } catch (error) {
    console.log('Firestore network initialization failed, will use local storage fallback');
  }
};

// Initialize with a timeout to prevent hanging connections
connectionTimeout = setTimeout(() => {
  console.log('Firestore connection timeout - using offline mode');
  disableFirestoreNetwork();
}, 10000); // 10 second timeout

initializeFirestoreConnection().then(() => {
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
  }
});

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Helper functions for handling offline scenarios
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
  } catch (error) {
    console.log('Failed to enable Firestore network:', error);
  }
};

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
  } catch (error) {
    console.log('Failed to disable Firestore network:', error);
  }
};

export default app;