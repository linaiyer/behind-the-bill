// Political figures database and API integration

import { PoliticalFigure, ChatResponse, PolicyContext, PoliticalChatAPI } from '../types/politicalChat';

// Sample political figures database
const POLITICAL_FIGURES: PoliticalFigure[] = [
  {
    id: 'trump',
    name: 'Donald Trump',
    title: 'Former President',
    party: 'Republican',
    position: '45th President of the United States',
    avatar: '🇺🇸',
    isActive: true,
    keyPolicies: ['Immigration', 'Trade', 'Tax Reform', 'Foreign Policy', 'Healthcare'],
    politicalStance: 'conservative',
    description: 'Former President focused on America First policies',
    bio: 'Donald Trump served as the 45th President of the United States from 2017 to 2021. Known for his business background and populist conservative policies.'
  },
  {
    id: 'biden',
    name: 'Joe Biden',
    title: 'President',
    party: 'Democratic',
    position: '46th President of the United States',
    avatar: '🇺🇸',
    isActive: true,
    keyPolicies: ['Infrastructure', 'Climate Change', 'Healthcare', 'Social Justice', 'International Relations'],
    politicalStance: 'liberal',
    description: 'Current President focused on unity and rebuilding',
    bio: 'Joe Biden is the 46th President of the United States, having served since 2021. Previously served as Vice President under Obama and as a long-time Senator from Delaware.'
  },
  {
    id: 'sanders',
    name: 'Bernie Sanders',
    title: 'Senator',
    party: 'Independent/Democratic',
    position: 'U.S. Senator from Vermont',
    avatar: '🌹',
    isActive: true,
    keyPolicies: ['Medicare for All', 'Green New Deal', 'Wealth Tax', 'Free College', 'Workers Rights'],
    politicalStance: 'progressive',
    description: 'Progressive champion of economic equality',
    bio: 'Bernie Sanders has served as the junior U.S. Senator from Vermont since 2007. Known for his progressive politics and advocacy for democratic socialism.'
  },
  {
    id: 'desantis',
    name: 'Ron DeSantis',
    title: 'Governor',
    party: 'Republican',
    position: 'Governor of Florida',
    avatar: '🐊',
    isActive: true,
    keyPolicies: ['Education Reform', 'Anti-Woke Policies', 'Immigration', 'Small Government', 'Free Speech'],
    politicalStance: 'conservative',
    description: 'Conservative governor focused on individual freedoms',
    bio: 'Ron DeSantis has served as the 46th Governor of Florida since 2019. Former U.S. Representative known for conservative policies and opposition to progressive ideology.'
  },
  {
    id: 'aoc',
    name: 'Alexandria Ocasio-Cortez',
    title: 'Representative',
    party: 'Democratic',
    position: 'U.S. Representative from New York',
    avatar: '🗽',
    isActive: true,
    keyPolicies: ['Green New Deal', 'Medicare for All', 'Housing Justice', 'Immigration Reform', 'Climate Action'],
    politicalStance: 'progressive',
    description: 'Progressive advocate for social and economic justice',
    bio: 'Alexandria Ocasio-Cortez has served as the U.S. Representative for New York\'s 14th congressional district since 2019. Known for her progressive politics and social media presence.'
  },
  {
    id: 'mcconnell',
    name: 'Mitch McConnell',
    title: 'Senator',
    party: 'Republican',
    position: 'U.S. Senator from Kentucky',
    avatar: '🇺🇸',
    isActive: true,
    keyPolicies: ['Judicial Appointments', 'Fiscal Conservatism', 'Limited Government', 'Second Amendment', 'Traditional Values'],
    politicalStance: 'conservative',
    description: 'Senior Republican leader and constitutional conservative',
    bio: 'Mitch McConnell has served as the senior U.S. Senator from Kentucky since 1985. Former Senate Majority Leader known for his strategic legislative approach.'
  }
];

// Policy knowledge base for generating responses
const POLICY_KNOWLEDGE: Record<string, Record<string, PolicyContext>> = {
  trump: {
    immigration: {
      topic: 'Immigration',
      stance: 'Strong border security, merit-based immigration system',
      reasoning: 'Believes in protecting American workers and national security through strict immigration controls',
      relatedBills: ['Border Security Act', 'Immigration Reform Bill'],
      historicalVotes: ['Voted for enhanced border security funding'],
      keyQuotes: ['We will build a great wall along the southern border', 'America First means American workers first']
    },
    healthcare: {
      topic: 'Healthcare',
      stance: 'Repeal and replace Affordable Care Act, market-based solutions',
      reasoning: 'Supports free market healthcare with price transparency and interstate competition',
      relatedBills: ['American Health Care Act', 'Health Savings Account Expansion'],
      historicalVotes: ['Attempted ACA repeal multiple times'],
      keyQuotes: ['We will have insurance for everybody', 'Healthcare should be competitive and affordable']
    },
    economy: {
      topic: 'Economy',
      stance: 'Tax cuts, deregulation, America First trade policies',
      reasoning: 'Believes in supply-side economics and protecting American industries',
      relatedBills: ['Tax Cuts and Jobs Act', 'USMCA Trade Agreement'],
      historicalVotes: ['Signed major tax reform legislation'],
      keyQuotes: ['We will make America great again', 'Trade wars are good and easy to win']
    }
  },
  biden: {
    infrastructure: {
      topic: 'Infrastructure',
      stance: 'Massive federal investment in infrastructure modernization',
      reasoning: 'Believes infrastructure investment creates jobs and improves competitiveness',
      relatedBills: ['Infrastructure Investment and Jobs Act', 'Build Back Better Act'],
      historicalVotes: ['Championed infrastructure spending throughout Senate career'],
      keyQuotes: ['Infrastructure is the backbone of our economy', 'Build back better than before']
    },
    climate: {
      topic: 'Climate Change',
      stance: 'Aggressive action on climate, clean energy transition',
      reasoning: 'Views climate change as existential threat requiring immediate action',
      relatedBills: ['Paris Climate Agreement', 'Clean Energy Standard'],
      historicalVotes: ['Rejoined Paris Climate Agreement'],
      keyQuotes: ['Climate change is the existential threat of our time', 'We can\'t wait any longer']
    },
    healthcare: {
      topic: 'Healthcare',
      stance: 'Strengthen and expand Affordable Care Act',
      reasoning: 'Believes healthcare is a right and government should ensure access',
      relatedBills: ['ACA Expansion Act', 'Public Option Bill'],
      historicalVotes: ['Helped pass original ACA as Vice President'],
      keyQuotes: ['Healthcare is a right, not a privilege', 'We need to build on the ACA']
    }
  },
  sanders: {
    healthcare: {
      topic: 'Healthcare',
      stance: 'Medicare for All, single-payer system',
      reasoning: 'Believes healthcare is a human right and private insurance is inefficient',
      relatedBills: ['Medicare for All Act', 'Prescription Drug Pricing Act'],
      historicalVotes: ['Consistently voted for single-payer healthcare'],
      keyQuotes: ['Healthcare is a human right', 'We need Medicare for All']
    },
    economy: {
      topic: 'Economic Inequality',
      stance: 'Wealth tax, $15 minimum wage, worker ownership',
      reasoning: 'Believes extreme inequality threatens democracy and economic justice',
      relatedBills: ['Raise the Wage Act', 'For the 99.5% Act'],
      historicalVotes: ['Voted for $15 minimum wage amendments'],
      keyQuotes: ['The billionaire class cannot have it all', 'Economic justice is social justice']
    },
    education: {
      topic: 'Education',
      stance: 'Free college tuition, student debt cancellation',
      reasoning: 'Believes education is a right and student debt crisis hurts economy',
      relatedBills: ['College for All Act', 'Student Debt Cancellation Act'],
      historicalVotes: ['Voted for student loan relief measures'],
      keyQuotes: ['Education should be a right, not a privilege', 'Cancel student debt now']
    }
  }
};

// Message validation to block personal questions
const BLOCKED_TOPICS = [
  'personal life', 'family', 'marriage', 'children', 'divorce', 'dating',
  'health', 'medical', 'age', 'weight', 'appearance', 'private',
  'scandal', 'affair', 'personal finances', 'net worth', 'salary',
  'home address', 'phone number', 'email', 'social security'
];

class PoliticalChatService implements PoliticalChatAPI {
  
  async searchFigures(query: string): Promise<PoliticalFigure[]> {
    // Add artificial delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return POLITICAL_FIGURES;
    }
    
    return POLITICAL_FIGURES.filter(figure => 
      figure.name.toLowerCase().includes(searchTerm) ||
      figure.title.toLowerCase().includes(searchTerm) ||
      figure.party.toLowerCase().includes(searchTerm) ||
      figure.keyPolicies.some(policy => policy.toLowerCase().includes(searchTerm))
    );
  }

  async getFigureDetails(figureId: string): Promise<PoliticalFigure> {
    // Add artificial delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const figure = POLITICAL_FIGURES.find(f => f.id === figureId);
    if (!figure) {
      throw new Error('Political figure not found');
    }
    return figure;
  }

  validateMessage(message: string): { isValid: boolean; reason?: string } {
    const lowerMessage = message.toLowerCase();
    
    for (const blockedTopic of BLOCKED_TOPICS) {
      if (lowerMessage.includes(blockedTopic)) {
        return {
          isValid: false,
          reason: `I can only discuss political views and policies, not personal matters like ${blockedTopic}.`
        };
      }
    }

    // Check for inappropriate content
    const inappropriateWords = ['hate', 'attack', 'violent', 'kill', 'death', 'hurt'];
    for (const word of inappropriateWords) {
      if (lowerMessage.includes(word)) {
        return {
          isValid: false,
          reason: 'I can only engage in respectful political discourse. Please keep our conversation civil.'
        };
      }
    }

    return { isValid: true };
  }

  async sendMessage(figureId: string, message: string, context?: any[]): Promise<ChatResponse> {
    // Add artificial delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validate message first
    const validation = this.validateMessage(message);
    if (!validation.isValid) {
      return {
        message: validation.reason || 'I cannot respond to that question.',
        isBlocked: true,
        blockReason: validation.reason,
        confidence: 1.0
      };
    }

    try {
      const figure = await this.getFigureDetails(figureId);
      const response = await this.generatePoliticalResponse(figure, message);
      return response;
    } catch (error) {
      // Fallback response for any errors
      return {
        message: "I apologize, but I'm having trouble accessing my knowledge base right now. Please try asking about my key policy positions.",
        isBlocked: false,
        confidence: 0.3
      };
    }
  }

  private async generatePoliticalResponse(figure: PoliticalFigure, message: string): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase();
    
    // Determine topic from message
    const topic = this.identifyTopic(lowerMessage);
    const figureKnowledge = POLICY_KNOWLEDGE[figure.id];
    
    if (figureKnowledge && figureKnowledge[topic]) {
      const policyContext = figureKnowledge[topic];
      return {
        message: this.generateContextualResponse(figure, policyContext, message),
        isBlocked: false,
        policyContext,
        confidence: 0.8
      };
    }

    // Fallback to general response
    return {
      message: this.generateGeneralResponse(figure, message),
      isBlocked: false,
      confidence: 0.6
    };
  }

  private identifyTopic(message: string): string {
    if (message.includes('health') || message.includes('medical') || message.includes('insurance')) {
      return 'healthcare';
    }
    if (message.includes('immigra') || message.includes('border') || message.includes('asylum')) {
      return 'immigration';
    }
    if (message.includes('climat') || message.includes('environment') || message.includes('green')) {
      return 'climate';
    }
    if (message.includes('econom') || message.includes('tax') || message.includes('job') || message.includes('trade')) {
      return 'economy';
    }
    if (message.includes('education') || message.includes('school') || message.includes('college')) {
      return 'education';
    }
    if (message.includes('infrastructure') || message.includes('road') || message.includes('bridge')) {
      return 'infrastructure';
    }
    return 'general';
  }

  private generateContextualResponse(figure: PoliticalFigure, policy: PolicyContext, message: string): string {
    const responses = [
      `On ${policy.topic}, my position is clear: ${policy.stance}. ${policy.reasoning}`,
      `I've consistently advocated for ${policy.stance.toLowerCase()} because ${policy.reasoning.toLowerCase()}`,
      `My approach to ${policy.topic.toLowerCase()} is based on ${policy.stance.toLowerCase()}. This is important because ${policy.reasoning.toLowerCase()}`,
      `When it comes to ${policy.topic.toLowerCase()}, I believe ${policy.stance.toLowerCase()}. ${policy.reasoning}`
    ];

    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add a relevant quote if available
    if (policy.keyQuotes.length > 0) {
      const quote = policy.keyQuotes[Math.floor(Math.random() * policy.keyQuotes.length)];
      return `${baseResponse}\n\nAs I've said before: "${quote}"`;
    }

    return baseResponse;
  }

  private generateGeneralResponse(figure: PoliticalFigure, message: string): string {
    const generalResponses = [
      `Thank you for your question. As ${figure.title}, I focus on policies that benefit the American people.`,
      `That's an important issue. My ${figure.party} values guide my approach to all policy matters.`,
      `I appreciate your interest in my political views. Let me share my perspective on this issue.`,
      `As someone who has served in ${figure.position}, I believe we need practical solutions.`
    ];

    const baseResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    
    // Add topic-specific context if possible
    if (figure.keyPolicies.length > 0) {
      const relevantPolicy = figure.keyPolicies[Math.floor(Math.random() * figure.keyPolicies.length)];
      return `${baseResponse} This relates to my work on ${relevantPolicy}, which is one of my key priorities.`;
    }

    return baseResponse;
  }
}

export const politicalChatService = new PoliticalChatService();
export { POLITICAL_FIGURES };