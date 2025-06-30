export interface Bill {
  id: string;
  title: string;
  summary: string;
  sponsor: string;
  status: 'introduced' | 'in_committee' | 'passed_house' | 'passed_senate' | 'enacted' | 'vetoed';
  introduced_date: string;
  latest_action: string;
  categories: string[];
  impact_areas: ImpactArea[];
}

export interface ImpactArea {
  category: 'education' | 'healthcare' | 'privacy' | 'economy' | 'environment' | 'social_justice';
  impact_level: 'low' | 'medium' | 'high';
  description: string;
  affected_groups: string[];
}

export interface User {
  id: string;
  name: string;
  interests: string[];
  location: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notification_enabled: boolean;
  preferred_categories: string[];
  chat_persona: 'politician' | 'expert' | 'advocate' | 'neutral';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  bill_context?: Bill;
}

export interface SimulationResult {
  bill_id: string;
  user_impact: string;
  community_impact: string;
  timeline: string;
  recommendations: string[];
} 