import { 
  signInWithCredential, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, NewsSubscription, UserPreferences } from '../types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

class AuthService {
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, this.handleAuthStateChange.bind(this));
  }

  private async handleAuthStateChange(firebaseUser: FirebaseUser | null) {
    if (firebaseUser) {
      const user = await this.createUserFromFirebaseUser(firebaseUser);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      this.notifyAuthStateListeners(user);
    } else {
      await AsyncStorage.removeItem('user');
      this.notifyAuthStateListeners(null);
    }
  }

  private async createUserFromFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      // Create new user document
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        newsSubscriptions: [],
        preferences: {
          interests: [],
          notificationsEnabled: true,
          theme: 'light'
        }
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp()
      });

      return newUser;
    }
  }

  async signInWithGoogle(): Promise<User | null> {
    try {
      // For development, simulate a successful Google login
      console.log('Simulating Google Sign-In...');
      
      // Create a realistic mock user for testing
      const mockUser: User = {
        uid: 'google-user-' + Date.now(),
        email: 'john.doe@gmail.com',
        displayName: 'John Doe',
        photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocJ1234567890abcdef=s96-c',
        createdAt: new Date(),
        newsSubscriptions: [],
        preferences: {
          interests: ['Politics', 'Economy', 'Healthcare'],
          notificationsEnabled: true,
          theme: 'light'
        }
      };

      // Store user in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      // Notify listeners
      this.notifyAuthStateListeners(mockUser);
      
      console.log('Mock Google user created:', mockUser);
      
      return mockUser;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        preferences: preferences
      });
      
      // Update local storage
      const user = await this.getCurrentUser();
      if (user) {
        const updatedUser = { ...user, preferences: { ...user.preferences, ...preferences } };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        this.notifyAuthStateListeners(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async addNewsSubscription(subscription: Omit<NewsSubscription, 'id' | 'addedAt'>): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    try {
      const newSubscription: NewsSubscription = {
        ...subscription,
        id: Date.now().toString(),
        addedAt: new Date()
      };

      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const updatedSubscriptions = [...userData.newsSubscriptions, newSubscription];
        
        await updateDoc(userRef, {
          newsSubscriptions: updatedSubscriptions
        });

        // Update local storage
        const updatedUser = { ...userData, newsSubscriptions: updatedSubscriptions };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        this.notifyAuthStateListeners(updatedUser);
      }
    } catch (error) {
      console.error('Error adding news subscription:', error);
      throw error;
    }
  }

  async removeNewsSubscription(subscriptionId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const updatedSubscriptions = userData.newsSubscriptions.filter(
          sub => sub.id !== subscriptionId
        );
        
        await updateDoc(userRef, {
          newsSubscriptions: updatedSubscriptions
        });

        // Update local storage
        const updatedUser = { ...userData, newsSubscriptions: updatedSubscriptions };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        this.notifyAuthStateListeners(updatedUser);
      }
    } catch (error) {
      console.error('Error removing news subscription:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(
        listener => listener !== callback
      );
    };
  }

  private notifyAuthStateListeners(user: User | null) {
    this.authStateListeners.forEach(listener => listener(user));
  }
}

export const authService = new AuthService();