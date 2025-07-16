import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser
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
    try {
      console.log('Attempting to get user document for:', firebaseUser.uid);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        console.log('Existing user found in Firestore');
        const userData = userDoc.data() as User;
        // Store in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        this.notifyAuthStateListeners(userData);
        return userData;
      } else {
        console.log('Creating new user document in Firestore');
        // Create new user document
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
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
        
        console.log('User document created successfully');

        // Store in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        this.notifyAuthStateListeners(newUser);

        return newUser;
      }
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      
      // If Firestore fails (offline, permission issues, etc.), create a local user
      console.log('Firestore failed, creating local user fallback');
      const localUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        newsSubscriptions: [],
        preferences: {
          interests: [],
          notificationsEnabled: true,
          theme: 'light'
        }
      };

      // Store in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(localUser));
      this.notifyAuthStateListeners(localUser);
      
      return localUser;
    }
  }

  async signInWithEmail(email: string, password: string, isSignUp: boolean = false): Promise<User | null> {
    try {
      console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} with email:`, email);
      let firebaseUser: FirebaseUser;
      
      if (isSignUp) {
        // Create new account
        console.log('Creating new Firebase user...');
        const result = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = result.user;
        console.log('Created new user:', firebaseUser.uid);
      } else {
        // Sign in existing user
        console.log('Signing in existing Firebase user...');
        const result = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = result.user;
        console.log('Signed in existing user:', firebaseUser.uid);
      }
      
      // Create or get user document (this handles Firestore failures gracefully)
      const user = await this.createUserFromFirebaseUser(firebaseUser);
      
      console.log('Successfully authenticated user:', user.email);
      return user;
      
    } catch (error: any) {
      console.error('Authentication error details:', {
        code: error.code,
        message: error.message,
        details: error
      });
      throw error; // Re-throw to let the UI handle the error
    }
  }

  // Keep the old method for backward compatibility (if needed)
  async signInWithGoogle(): Promise<User | null> {
    // This method is kept for backward compatibility
    // but will show an alert asking users to use the email form instead
    console.log('signInWithGoogle called - redirecting to email auth');
    return null;
  }


  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      console.log('User signed out successfully');
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
      // Update local storage first (works offline)
      const user = await this.getCurrentUser();
      if (user) {
        const updatedUser = { ...user, preferences: { ...user.preferences, ...preferences } };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        this.notifyAuthStateListeners(updatedUser);
      }

      // Try to update Firestore (will fail gracefully if offline)
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          preferences: preferences
        });
        console.log('User preferences synced to Firestore');
      } catch (firestoreError) {
        console.log('Firestore offline - preferences saved locally only');
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