// Types for political figure chatbot

export interface PoliticalFigure {
  id: string;
  name: string;
  title: string;
  party: string;
  position: string;
  avatar: string;
  isActive: boolean;
  keyPolicies: string[];
  politicalStance: 'progressive' | 'liberal' | 'moderate' | 'conservative' | 'libertarian';
  description: string;
  bio: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  figureId?: string;
  isBlocked?: boolean;
  blockReason?: string;
}

export interface ChatSession {
  id: string;
  figureId: string;
  figureName: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
}

export interface PolicyContext {
  topic: string;
  stance: string;
  reasoning: string;
  relatedBills: string[];
  historicalVotes: string[];
  keyQuotes: string[];
}

export interface ChatResponse {
  message: string;
  isBlocked: boolean;
  blockReason?: string;
  policyContext?: PolicyContext;
  confidence: number;
}

export interface PoliticalChatAPI {
  searchFigures: (query: string) => Promise<PoliticalFigure[]>;
  getFigureDetails: (figureId: string) => Promise<PoliticalFigure>;
  sendMessage: (figureId: string, message: string, context?: ChatMessage[]) => Promise<ChatResponse>;
  validateMessage: (message: string) => { isValid: boolean; reason?: string };
}