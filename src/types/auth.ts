export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  newsSubscriptions: NewsSubscription[];
  preferences: UserPreferences;
}

export interface NewsSubscription {
  id: string;
  provider: string; // 'nytimes', 'washingtonpost', 'wsj', etc.
  apiKey?: string;
  username?: string;
  isActive: boolean;
  addedAt: Date;
}

export interface UserPreferences {
  interests: string[];
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}