import AsyncStorage from '@react-native-async-storage/async-storage';

// AI-powered highlighting service using OpenAI GPT
export interface AIHighlightedTerm {
  term: string;
  fullPhrase: string;
  startIndex: number;
  endIndex: number;
  category: string;
  relevanceScore: number;
  explanation: string;
}

export interface AIHighlightingConfig {
  openaiApiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

class AIHighlightingService {
  private config: AIHighlightingConfig;
  private cache: Map<string, AIHighlightedTerm[]> = new Map();

  constructor(config: AIHighlightingConfig) {
    this.config = {
      model: 'gpt-3.5-turbo',
      maxTokens: 1500,
      temperature: 0.1,
      ...config
    };
  }

  async highlightPoliticalTerms(text: string): Promise<AIHighlightedTerm[]> {
    // Check if AI highlighting is enabled
    const useAI = await this.shouldUseAI();
    if (!useAI) {
      return [];
    }

    // Check cache first for performance
    const cacheKey = this.hashText(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Load API key from storage if not in config
      if (!this.config.openaiApiKey) {
        const savedApiKey = await AsyncStorage.getItem('openai_api_key');
        if (savedApiKey) {
          this.config.openaiApiKey = savedApiKey;
        }
      }

      // If OpenAI API key is available, use GPT
      if (this.config.openaiApiKey) {
        const result = await this.highlightWithOpenAI(text);
        this.cache.set(cacheKey, result);
        return result;
      }
      
      // Fallback to local AI-like processing
      console.log('No OpenAI API key found, using local intelligent patterns');
      const result = await this.highlightWithLocalAI(text);
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('AI highlighting failed, using fallback:', error);
      const result = await this.highlightWithLocalAI(text);
      this.cache.set(cacheKey, result);
      return result;
    }
  }

  private async shouldUseAI(): Promise<boolean> {
    try {
      const setting = await AsyncStorage.getItem('use_ai_highlighting');
      return setting !== null ? JSON.parse(setting) : true; // Default to true
    } catch (error) {
      console.error('Failed to check AI setting:', error);
      return true; // Default to true on error
    }
  }

  private async highlightWithOpenAI(text: string): Promise<AIHighlightedTerm[]> {
    const prompt = `You are an expert political analyst. Analyze the following text and identify the most important political terms that should be highlighted for readers. Be COMPREHENSIVE in finding political entities.

1. **Comprehensive Political Term Categories:**
   - **Bill identifiers**: H.R. 1234, S. 987, AB 42, SB 123, etc.
   - **ANY legislation ending in**: Act, Bill, Law, Code, Reform, Regulation, Directive
     Examples: "Rights and Endorsements Act", "Clean Air Act", "Voting Rights Act"
   - **Congressional committees**: ANY committee with "Committee" in the name
     Examples: "House Energy and Commerce Committee", "Senate Judiciary Committee", "Ways and Means Committee"
   - **Government agencies/departments**: Department of X, X Agency, X Administration, X Commission, X Bureau
   - **Major programs**: Medicare, Social Security, SNAP, any named government program
   - **Political institutions**: Senate, Congress, Supreme Court, Federal Reserve, etc.
   - **Policy phrases**: continuing resolution, omnibus spending package, executive order, etc.
   - **Think tanks/organizations**: X Foundation, X Institute, X Center, X Council

2. **Detection Rules:**
   - **FIND ALL CAPITALIZED MULTI-WORD PHRASES** that end in: Act, Bill, Law, Committee, Commission, Agency, Administration, Department, Foundation, Institute, Center
   - Look for patterns like "House [anything] Committee" or "Senate [anything] Committee"
   - Find ANY proper noun phrase that could be legislation, even if not in your training data
   - Capture the FULL OFFICIAL NAME (e.g., "House Energy and Commerce Committee", not just "House Committee")
   
3. **Important criteria:**
   - BE AGGRESSIVE in finding political terms - err on the side of inclusion
   - Only exclude obviously generic words like "president", "government", "policy" by themselves
   - Do NOT highlight generic verbs, money figures, or single common words
   - Rate relevance 7-10 (include terms scoring 7+)
   - If uncertain about a capitalized phrase that could be political, INCLUDE IT

Text to analyze:
"${text}"

Return as valid JSON array with ALL political entities found:
[
  {
    "term": "canonical name",
    "fullPhrase": "exact phrase from text",
    "startIndex": number,
    "endIndex": number,
    "category": "appropriate_category",
    "relevanceScore": number,
    "explanation": "why this term is important"
  }
]

BE THOROUGH - find every possible political entity, legislation name, and committee.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.openaiApiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a political analysis expert. Return only valid JSON arrays of important political terms to highlight.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const terms = JSON.parse(content);
      return Array.isArray(terms) ? this.validateAndCleanTerms(terms, text) : [];
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw parseError;
    }
  }

  private async highlightWithLocalAI(text: string): Promise<AIHighlightedTerm[]> {
    // Intelligent local processing that mimics AI behavior
    const terms: AIHighlightedTerm[] = [];
    
    // Smart patterns with context awareness and relevance scoring
    const intelligentPatterns = [
      // High-value bill identifiers
      {
        regex: /\b(H\.R\.\s*\d+|S\.\s*\d+|H\.\s*\d+|S\.B\.\s*\d+|AB\s*\d+|SB\s*\d+)\b/gi,
        category: 'bill_identifier',
        baseRelevance: 9,
        explanation: 'Congressional bill identifier - direct reference to specific legislation'
      },
      
      // POLITICAL ACRONYMS - High priority, specific matches (excluding common tech acronyms)
      {
        regex: /\b(ICE|MAGA|DHS|DOJ|DOD|DOE|HHS|HUD|DOT|USDA|VA|OMB|CBO|GAO|CRS|FEC|FTC|SEC|FDIC|OCC|CFTC|NLRB|EEOC|FCC|EPA|FDA|CDC|NIH|NSF|NOAA|NIST|OSHA|TSA|CBP|DEA|ATF|FBI|CIA|NSA|DIA|NGA|NSC|ODNI|CFPB|SBA|FEMA|GSA|OPM|SSA|IRS|USPS)\b/g,
        category: 'government_acronym',
        baseRelevance: 9,
        explanation: 'Government agency or political movement acronym'
      },
      
      // POLITICAL ADMINISTRATIONS - More precise matching with word boundaries
      {
        regex: /\b(Trump|Biden|Obama|Bush|Clinton|Reagan|Carter)\s+Administration\b/g,
        category: 'political_administration',
        baseRelevance: 9,
        explanation: 'Presidential administration reference'
      },
      
      // COMPREHENSIVE FORMAL LEGISLATION PATTERNS - More precise
      {
        regex: /\b([A-Z][A-Za-z]+(?:\s+(?:and|of|for|to|on|in|with|by|from|under|through)\s+[A-Z][A-Za-z]+)*(?:\s+[A-Z][A-Za-z]+)*\s+(?:Act|Bill|Law|Code|Reform|Regulation|Directive))\b/g,
        category: 'formal_legislation',
        baseRelevance: 9,
        explanation: 'Federal or state legislation with formal naming convention'
      },
      
      // CONGRESSIONAL COMMITTEES - More precise patterns
      {
        regex: /\b(House\s+(?:[A-Z][A-Za-z]+\s+)*(?:and\s+[A-Z][A-Za-z]+\s+)*Committee)\b/g,
        category: 'congressional_committee',
        baseRelevance: 8,
        explanation: 'House committee with legislative oversight responsibilities'
      },
      {
        regex: /\b(Senate\s+(?:[A-Z][A-Za-z]+\s+)*(?:and\s+[A-Z][A-Za-z]+\s+)*Committee)\b/g,
        category: 'congressional_committee',
        baseRelevance: 8,
        explanation: 'Senate committee with legislative oversight responsibilities'
      },
      {
        regex: /\b((?:[A-Z][A-Za-z]+\s+)*(?:and\s+[A-Z][A-Za-z]+\s+)*Committee)(?:\s+of\s+the\s+(?:House|Senate))?\b/g,
        category: 'congressional_committee',
        baseRelevance: 8,
        explanation: 'Congressional committee with policy jurisdiction'
      },
      
      // GOVERNMENT AGENCIES AND DEPARTMENTS - More precise
      {
        regex: /\b(Department\s+of\s+[A-Z][A-Za-z]+(?:\s+and\s+[A-Z][A-Za-z]+)*)\b/g,
        category: 'government_agency',
        baseRelevance: 8,
        explanation: 'Federal executive department'
      },
      {
        regex: /\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\s+(?:Agency|Administration|Commission|Bureau|Service|Office))\b/g,
        category: 'government_agency',
        baseRelevance: 8,
        explanation: 'Federal agency or administrative body'
      },
      
      // Specific high-profile agencies (higher relevance)
      {
        regex: /\b(Environmental Protection Agency|Food and Drug Administration|Centers for Disease Control|Federal Bureau of Investigation|Central Intelligence Agency|Internal Revenue Service|Social Security Administration|EPA|FDA|CDC|FBI|CIA|IRS|SSA)\b/gi,
        category: 'government_agency',
        baseRelevance: 9,
        explanation: 'Major federal agency with significant public impact'
      },
      
      // Major known legislation (highest relevance)
      {
        regex: /\b(Infrastructure Investment and Jobs Act|Inflation Reduction Act|CHIPS and Science Act|American Rescue Plan Act|Affordable Care Act|Build Back Better Act|Tax Cuts and Jobs Act|CARES Act|Patriot Act|Civil Rights Act|Americans with Disabilities Act|Voting Rights Act)\b/gi,
        category: 'major_legislation',
        baseRelevance: 10,
        explanation: 'Major federal legislation with significant policy impact'
      },
      
      // Critical entitlement programs
      {
        regex: /\b(Social Security|Medicare|Medicaid|Supplemental Nutrition Assistance Program|SNAP|CHIP|TANF|WIC|Food Stamps)\b/gi,
        category: 'entitlement_program',
        baseRelevance: 9,
        explanation: 'Major federal benefit program affecting millions of Americans'
      },
      
      // Political institutions and bodies
      {
        regex: /\b(Supreme Court|Federal Reserve|Senate|House of Representatives|Congress|Electoral College|Federal Election Commission|Office of Management and Budget)\b/gi,
        category: 'political_institution',
        baseRelevance: 8,
        explanation: 'Core governmental institution with constitutional significance'
      },
      
      // Policy and procedural terms
      {
        regex: /\b(continuing resolution|omnibus spending package|rescissions bill|filibuster|gerrymandering|judicial review|executive order|presidential memorandum|congressional hearing|markup session)\b/gi,
        category: 'special_policy_phrase',
        baseRelevance: 7,
        explanation: 'Important political process or procedural term'
      },
      
      // Economic/trade policy terms
      {
        regex: /\b(NAFTA|USMCA|tariff|trade war|sanctions|interest rates|federal funds rate|quantitative easing|fiscal policy|monetary policy)\b/gi,
        category: 'economic_policy',
        baseRelevance: 8,
        explanation: 'Economic policy term with broad impact on trade and finance'
      },
      
      // Think tanks and policy organizations
      {
        regex: /\b([A-Z][A-Za-z]*(?:\s+[A-Za-z]*)*\s+(?:Foundation|Institute|Center|Council|Organization|Coalition|Alliance))(?:\s+(?:for|on|of)\s+[A-Za-z]+(?:\s+[A-Za-z]+)*)?/g,
        category: 'think_tank',
        baseRelevance: 7,
        explanation: 'Policy research organization or advocacy group'
      },
      
      // Emerging policy areas
      {
        regex: /\b(climate change|Green New Deal|Paris Climate Agreement|carbon tax|renewable energy|artificial intelligence|cybersecurity|cryptocurrency|net neutrality|data privacy)\b/gi,
        category: 'emerging_policy',
        baseRelevance: 7,
        explanation: 'Contemporary policy area of growing political importance'
      }
    ];

    // Process each pattern with intelligent relevance scoring
    for (const pattern of intelligentPatterns) {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        const fullPhrase = match[0].trim();
        const startIndex = match.index;
        const endIndex = match.index + fullPhrase.length;
        
        // Enhanced boundary checking to prevent over-matching
        const beforeChar = startIndex > 0 ? text[startIndex - 1] : ' ';
        const afterChar = endIndex < text.length ? text[endIndex] : ' ';
        
        // Ensure proper word boundaries for better precision
        const hasProperBoundaries = this.hasProperWordBoundaries(text, startIndex, endIndex, fullPhrase);
        
        if (!hasProperBoundaries) {
          continue; // Skip this match if it doesn't have proper boundaries
        }
        
        // Calculate context-aware relevance score
        const relevanceScore = this.calculateContextualRelevance(
          text, 
          fullPhrase, 
          startIndex, 
          pattern.baseRelevance
        );
        
        // Only include terms with high relevance (7+)
        if (relevanceScore >= 7) {
          // Additional quality filters
          const isValidTerm = this.isValidPoliticalTerm(fullPhrase, pattern.category);
          
          if (isValidTerm) {
            // Check for duplicates and overlaps
            const isDuplicate = terms.some(existing => 
              Math.abs(existing.startIndex - startIndex) < 5 || 
              existing.term.toLowerCase() === fullPhrase.toLowerCase()
            );
            
            if (!isDuplicate) {
              terms.push({
                term: fullPhrase,
                fullPhrase,
                startIndex,
                endIndex,
                category: pattern.category,
                relevanceScore,
                explanation: pattern.explanation
              });
            }
          }
        }
      }
    }

    // Apply AI-like filtering and ranking
    return this.applyIntelligentFiltering(terms);
  }

  private isValidPoliticalTerm(term: string, category: string): boolean {
    const termLower = term.toLowerCase();
    
    // Filter out terms that are too generic or likely false positives
    const genericTerms = [
      'committee', 'commission', 'department', 'agency', 'office', 'bureau',
      'act', 'bill', 'law', 'code', 'reform', 'regulation', 'directive',
      'foundation', 'institute', 'center', 'council', 'organization'
    ];
    
    // Don't highlight if it's just a generic term by itself
    if (genericTerms.includes(termLower)) {
      return false;
    }
    
    // Must have at least 2 words for most categories (except acronyms)
    const wordCount = term.trim().split(/\s+/).length;
    if (wordCount < 2 && !['bill_identifier', 'government_acronym'].includes(category)) {
      return false;
    }
    
    // Filter out obvious non-political terms that might match patterns
    const nonPoliticalPatterns = [
      /^(news|sports|entertainment|business|technology|health|lifestyle) /i,
      /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday) /i,
      /^(january|february|march|april|may|june|july|august|september|october|november|december) /i,
      /^\d+\s+(street|avenue|road|lane|drive|boulevard)/i,
      /^(new|old|big|small|large|great|major|minor) [a-z]/i,
      /^(the\s+post|says|nvidia|post\s+)/i // Prevent "The post Nvidia Says Trump Administration" issues
    ];
    
    if (nonPoliticalPatterns.some(pattern => pattern.test(term))) {
      return false;
    }
    
    // Additional boundary checking to prevent over-matching
    if (category === 'political_administration') {
      // Ensure we don't capture non-political prefixes
      const administrationMatch = term.match(/\b(\w+\s+Administration)\b/i);
      if (administrationMatch) {
        const prefix = administrationMatch[1].split(' ')[0].toLowerCase();
        const validPrefixes = ['trump', 'biden', 'obama', 'bush', 'clinton', 'reagan', 'carter'];
        return validPrefixes.includes(prefix);
      }
    }
    
    // Additional category-specific validation
    if (category === 'congressional_committee') {
      // Must contain either "House", "Senate", or end with "Committee"
      return /\b(house|senate)\b/i.test(term) || /committee$/i.test(term);
    }
    
    if (category === 'formal_legislation') {
      // Must be at least 3 words and contain proper nouns
      if (wordCount < 3) return false;
      // Should have at least 2 capitalized words
      const capitalWords = (term.match(/\b[A-Z][a-z]+/g) || []).length;
      return capitalWords >= 2;
    }
    
    // Validate government acronyms
    if (category === 'government_acronym') {
      // Must be 2-6 characters, all caps
      if (!/^[A-Z]{2,6}$/.test(term.trim())) {
        return false;
      }
      
      // Exclude common non-political acronyms
      const nonPoliticalAcronyms = [
        'AI', 'IT', 'API', 'URL', 'HTML', 'CSS', 'JS', 'UI', 'UX', 'OS', 'PC', 'TV', 'DVD', 'GPS', 'USB', 'PDF', 'MP3', 'MP4'
      ];
      
      if (nonPoliticalAcronyms.includes(term.trim())) {
        return false;
      }
      
      return true;
    }
    
    return true;
  }

  private hasProperWordBoundaries(text: string, startIndex: number, endIndex: number, term: string): boolean {
    // Check characters before and after the match
    const beforeChar = startIndex > 0 ? text[startIndex - 1] : ' ';
    const afterChar = endIndex < text.length ? text[endIndex] : ' ';
    
    // For word boundary checking, these should be non-word characters or beginning/end of string
    const isValidStart = /\s|^/.test(beforeChar) || /[^\w]/.test(beforeChar);
    const isValidEnd = /\s|$/.test(afterChar) || /[^\w]/.test(afterChar);
    
    // Special handling for certain categories
    if (term.includes('Administration')) {
      // Prevent matching "The post Nvidia Says Trump Administration" by checking for unwanted prefixes
      const contextBefore = text.substring(Math.max(0, startIndex - 20), startIndex).toLowerCase();
      if (/\b(the\s+post|says|nvidia)\b/.test(contextBefore)) {
        return false;
      }
    }
    
    // For acronyms, ensure they're standalone
    if (/^[A-Z]{2,6}$/.test(term.trim())) {
      return isValidStart && isValidEnd;
    }
    
    return isValidStart && isValidEnd;
  }

  private calculateContextualRelevance(
    text: string, 
    term: string, 
    position: number, 
    baseRelevance: number
  ): number {
    let relevance = baseRelevance;
    
    // Get surrounding context (100 chars before and after)
    const contextStart = Math.max(0, position - 100);
    const contextEnd = Math.min(text.length, position + term.length + 100);
    const context = text.substring(contextStart, contextEnd).toLowerCase();
    
    // Boost relevance for certain contexts
    const boostKeywords = [
      'vote', 'legislation', 'bill', 'congress', 'senate', 'house',
      'policy', 'program', 'budget', 'funding', 'reform', 'debate',
      'committee', 'hearing', 'amendment', 'law', 'regulation'
    ];
    
    const contextBoosts = boostKeywords.filter(keyword => 
      context.includes(keyword)
    ).length;
    
    relevance += Math.min(contextBoosts * 0.5, 2); // Max boost of 2 points
    
    // Reduce relevance if term appears very frequently (likely too generic)
    const termCount = (text.match(new RegExp(term, 'gi')) || []).length;
    if (termCount > 5) {
      relevance -= 1;
    }
    
    return Math.max(1, Math.min(10, relevance));
  }

  private applyIntelligentFiltering(terms: AIHighlightedTerm[]): AIHighlightedTerm[] {
    // Remove overlapping terms (keep higher relevance)
    const filtered = terms.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const result: AIHighlightedTerm[] = [];
    
    for (const term of filtered) {
      const hasOverlap = result.some(existing => 
        (term.startIndex < existing.endIndex && term.endIndex > existing.startIndex)
      );
      
      if (!hasOverlap) {
        result.push(term);
      }
    }
    
    // Limit to most relevant terms (max 15 per article)
    return result
      .sort((a, b) => a.startIndex - b.startIndex)
      .slice(0, 15);
  }

  private validateAndCleanTerms(terms: any[], text: string): AIHighlightedTerm[] {
    return terms
      .filter(term => 
        term.term && 
        term.fullPhrase && 
        typeof term.startIndex === 'number' && 
        typeof term.endIndex === 'number' &&
        term.relevanceScore >= 7
      )
      .map(term => ({
        term: term.term,
        fullPhrase: term.fullPhrase,
        startIndex: term.startIndex,
        endIndex: term.endIndex,
        category: term.category || 'unknown',
        relevanceScore: term.relevanceScore || 7,
        explanation: term.explanation || 'Political term of interest'
      }))
      .filter(term => 
        term.startIndex >= 0 && 
        term.endIndex <= text.length &&
        term.startIndex < term.endIndex
      )
      .sort((a, b) => a.startIndex - b.startIndex);
  }

  private hashText(text: string): string {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Method to configure API key at runtime
  setApiKey(apiKey: string) {
    this.config.openaiApiKey = apiKey;
  }

  // Clear cache for memory management
  clearCache() {
    this.cache.clear();
  }
}

// Get configuration from environment or return default
function getAIConfig(): AIHighlightingConfig {
  return {
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    maxTokens: 1500,
    temperature: 0.1
  };
}

// Export configured instance
export const aiHighlightingService = new AIHighlightingService(getAIConfig());

// Export main function
export async function highlightPoliticalTermsWithAI(text: string): Promise<AIHighlightedTerm[]> {
  return await aiHighlightingService.highlightPoliticalTerms(text);
}