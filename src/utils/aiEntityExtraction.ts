// AI-powered entity extraction using OpenAI or Claude API
// This will replace the pattern-matching approach with real AI

interface ExtractedEntity {
  term: string;
  fullPhrase: string;
  startIndex: number;
  endIndex: number;
  category: string;
  description: string;
  specificName?: string; // For resolving generic references like "this bill"
}

interface AIEntityExtractionConfig {
  apiKey?: string;
  provider: 'openai' | 'anthropic' | 'huggingface';
  model?: string;
}

class AIEntityExtractor {
  private config: AIEntityExtractionConfig;

  constructor(config: AIEntityExtractionConfig) {
    this.config = config;
  }

  async extractPoliticalEntities(text: string): Promise<ExtractedEntity[]> {
    try {
      // Use OpenAI GPT for entity extraction (if API key provided)
      if (this.config.provider === 'openai' && this.config.apiKey) {
        const openaiResult = await this.extractWithOpenAI(text);
        if (openaiResult.length > 0) {
          return openaiResult;
        }
      }
      
      // Use HuggingFace for free NER (if configured)
      if (this.config.provider === 'huggingface') {
        const hfResult = await this.extractWithHuggingFace(text);
        if (hfResult.length > 0) {
          return hfResult;
        }
      }

      // Always fallback to improved pattern matching (works without API)
      return await this.extractWithImprovedPatterns(text);
    } catch (error) {
      console.error('Error in AI entity extraction, falling back to patterns:', error);
      // Always fallback to pattern matching if APIs fail
      return await this.extractWithImprovedPatterns(text);
    }
  }

  private async extractWithOpenAI(text: string): Promise<ExtractedEntity[]> {
    const prompt = `
You are an expert at extracting political entities from news articles. Your job is to identify specific political entities and resolve generic references to their actual names.

Instructions:
1. Find specific bills, laws, policies, departments, and institutions
2. When you see generic references like "this bill", "the legislation", "this policy", look at the surrounding context to find the actual name
3. Extract the SPECIFIC names, not generic terms
4. Return entities with their exact positions in the text

Text to analyze:
"${text}"

Return a JSON array of entities in this exact format:
[
  {
    "term": "actual specific name",
    "fullPhrase": "phrase as it appears in text", 
    "startIndex": number,
    "endIndex": number,
    "category": "bill|law|policy|department|institution|program",
    "description": "brief description",
    "specificName": "resolved specific name if different from fullPhrase"
  }
]

Example: If text says "Politicians voted yes on this spending bill" but earlier mentioned "Infrastructure Investment and Jobs Act", then:
- fullPhrase: "this spending bill"
- specificName: "Infrastructure Investment and Jobs Act"

Only return valid JSON. Do not include generic words like "president", "government", "politician".
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert political entity extraction system. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        return [];
      }

      // Parse the JSON response
      const entities = JSON.parse(content);
      return Array.isArray(entities) ? entities : [];

    } catch (error) {
      console.error('OpenAI extraction failed:', error);
      return [];
    }
  }

  private async extractWithHuggingFace(text: string): Promise<ExtractedEntity[]> {
    try {
      // Use HuggingFace's free NER API
      const response = await fetch(
        'https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: text
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const entities = await response.json();
      
      // Convert HuggingFace format to our format
      const extractedEntities: ExtractedEntity[] = [];
      
      if (Array.isArray(entities)) {
        entities.forEach((entity: any) => {
          if (entity.entity_group === 'ORG' || entity.entity_group === 'MISC') {
            // Filter for political-relevant entities
            const word = entity.word.replace(/^##/, ''); // Remove BERT tokens
            
            extractedEntities.push({
              term: word,
              fullPhrase: word,
              startIndex: entity.start,
              endIndex: entity.end,
              category: this.categorizeEntity(word),
              description: `Political entity: ${word}`
            });
          }
        });
      }

      return extractedEntities;

    } catch (error) {
      console.error('HuggingFace extraction failed:', error);
      return [];
    }
  }

  private categorizeEntity(entityName: string): string {
    const name = entityName.toLowerCase();
    
    if (name.includes('bill') || name.includes('act')) return 'bill';
    if (name.includes('department') || name.includes('agency')) return 'department';
    if (name.includes('congress') || name.includes('senate') || name.includes('house')) return 'institution';
    if (name.includes('policy') || name.includes('program')) return 'program';
    
    return 'institution';
  }

  private async extractWithImprovedPatterns(text: string): Promise<ExtractedEntity[]> {
    // Enhanced pattern-based extraction with sophisticated context resolution
    const entities: ExtractedEntity[] = [];
    const specificEntityMap = new Map<string, {name: string, category: string}>();
    
    // Comprehensive patterns for specific named entities - ORDER MATTERS! Longer phrases first
    const specificNamePatterns = [
      // LONGEST phrases first to prevent shorter matches from interfering
      
      // Full department names first (longest)
      {
        regex: /Department of Health and Human Services/gi,
        category: 'department'
      },
      {
        regex: /Department of Homeland Security/gi,
        category: 'department'
      },
      {
        regex: /Department of Veterans Affairs/gi,
        category: 'department'
      },
      {
        regex: /Department of Transportation/gi,
        category: 'department'
      },
      {
        regex: /Department of Agriculture/gi,
        category: 'department'
      },
      {
        regex: /Department of Education/gi,
        category: 'department'
      },
      {
        regex: /Department of Defense/gi,
        category: 'department'
      },
      {
        regex: /Department of Justice/gi,
        category: 'department'
      },
      {
        regex: /Department of Energy/gi,
        category: 'department'
      },
      {
        regex: /Department of Labor/gi,
        category: 'department'
      },
      {
        regex: /Department of Treasury/gi,
        category: 'department'
      },
      {
        regex: /Department of State/gi,
        category: 'department'
      },
      
      // Full agency names (longer than abbreviations)
      {
        regex: /Environmental Protection Agency/gi,
        category: 'department'
      },
      {
        regex: /Food and Drug Administration/gi,
        category: 'department'
      },
      {
        regex: /Centers for Disease Control and Prevention/gi,
        category: 'department'
      },
      {
        regex: /Centers for Disease Control/gi,
        category: 'department'
      },
      {
        regex: /Federal Bureau of Investigation/gi,
        category: 'department'
      },
      {
        regex: /Central Intelligence Agency/gi,
        category: 'department'
      },
      {
        regex: /National Security Agency/gi,
        category: 'department'
      },
      {
        regex: /Internal Revenue Service/gi,
        category: 'department'
      },
      {
        regex: /Social Security Administration/gi,
        category: 'department'
      },
      {
        regex: /Federal Communications Commission/gi,
        category: 'department'
      },
      {
        regex: /Securities and Exchange Commission/gi,
        category: 'department'
      },
      
      // Political movements and slogans (longer phrases first)
      {
        regex: /Make America Great Again Movement/gi,
        category: 'movement'
      },
      {
        regex: /Make America Great Again/gi,
        category: 'movement'
      },
      {
        regex: /Tea Party Movement/gi,
        category: 'movement'
      },
      {
        regex: /Black Lives Matter/gi,
        category: 'movement'
      },
      {
        regex: /MAGA Movement/gi,
        category: 'movement'
      },
      {
        regex: /Tea Party/gi,
        category: 'movement'
      },
      {
        regex: /Secret Service/gi,
        category: 'department'
      },
      {
        regex: /Proud Boys/gi,
        category: 'movement'
      },
      {
        regex: /Antifa/gi,
        category: 'movement'
      },
      {
        regex: /QAnon/gi,
        category: 'movement'
      },
      
      // Agency abbreviations LAST (shortest matches)
      {
        regex: /\bEPA\b/gi,
        category: 'department'
      },
      {
        regex: /\bFDA\b/gi,
        category: 'department'
      },
      {
        regex: /\bCDC\b/gi,
        category: 'department'
      },
      {
        regex: /\bFBI\b/gi,
        category: 'department'
      },
      {
        regex: /\bCIA\b/gi,
        category: 'department'
      },
      {
        regex: /\bNSA\b/gi,
        category: 'department'
      },
      {
        regex: /\bIRS\b/gi,
        category: 'department'
      },
      {
        regex: /\bSSA\b/gi,
        category: 'department'
      },
      {
        regex: /\bFCC\b/gi,
        category: 'department'
      },
      {
        regex: /\bSEC\b/gi,
        category: 'department'
      },
      {
        regex: /\bMAGA\b/gi,
        category: 'movement'
      },
      {
        regex: /\bBLM\b/gi,
        category: 'movement'
      },
      
      // Major Bills and Acts - List them individually for better matching
      {
        regex: /Infrastructure Investment and Jobs Act/gi,
        category: 'bill'
      },
      {
        regex: /Inflation Reduction Act/gi,
        category: 'bill'
      },
      {
        regex: /CHIPS and Science Act/gi,
        category: 'bill'
      },
      {
        regex: /Build Back Better Act/gi,
        category: 'bill'
      },
      {
        regex: /American Rescue Plan Act/gi,
        category: 'bill'
      },
      {
        regex: /CARES Act/gi,
        category: 'bill'
      },
      {
        regex: /Tax Cuts and Jobs Act/gi,
        category: 'bill'
      },
      {
        regex: /Affordable Care Act/gi,
        category: 'bill'
      },
      {
        regex: /Big Beautiful Bill/gi,
        category: 'bill'
      },
      
      // Trade and Economic Terms
      {
        regex: /tariff/gi,
        category: 'policy'
      },
      {
        regex: /tariffs/gi,
        category: 'policy'
      },
      {
        regex: /NAFTA/gi,
        category: 'policy'
      },
      {
        regex: /North American Free Trade Agreement/gi,
        category: 'policy'
      },
      {
        regex: /USMCA/gi,
        category: 'policy'
      },
      {
        regex: /trade war/gi,
        category: 'policy'
      },
      {
        regex: /sanctions/gi,
        category: 'policy'
      },
      {
        regex: /embargo/gi,
        category: 'policy'
      },
      
      // Government institutions
      {
        regex: /Federal Reserve/gi,
        category: 'institution'
      },
      {
        regex: /Supreme Court/gi,
        category: 'institution'
      },
      {
        regex: /Congress/gi,
        category: 'institution'
      },
      {
        regex: /Senate/gi,
        category: 'institution'
      },
      {
        regex: /House of Representatives/gi,
        category: 'institution'
      },
      
      // Specific programs and policies
      {
        regex: /Medicare for All/gi,
        category: 'program'
      },
      {
        regex: /Green New Deal/gi,
        category: 'program'
      },
      {
        regex: /Social Security/gi,
        category: 'program'
      },
      {
        regex: /Medicare/gi,
        category: 'program'
      },
      {
        regex: /Medicaid/gi,
        category: 'program'
      },
      {
        regex: /Obamacare/gi,
        category: 'program'
      },
      
      // Political concepts
      {
        regex: /filibuster/gi,
        category: 'concept'
      },
      {
        regex: /gerrymandering/gi,
        category: 'concept'
      },
      {
        regex: /electoral college/gi,
        category: 'concept'
      },
      
      // Congressional committees
      {
        regex: /House Committee on Homeland Security/gi,
        category: 'institution'
      },
      {
        regex: /Senate Committee on Foreign Relations/gi,
        category: 'institution'
      },
      {
        regex: /House Judiciary Committee/gi,
        category: 'institution'
      },
      {
        regex: /Senate Judiciary Committee/gi,
        category: 'institution'
      },
      {
        regex: /House Intelligence Committee/gi,
        category: 'institution'
      },
      {
        regex: /Senate Intelligence Committee/gi,
        category: 'institution'
      },
      {
        regex: /Homeland Security Committee/gi,
        category: 'institution'
      },
      {
        regex: /Ways and Means Committee/gi,
        category: 'institution'
      },
      {
        regex: /Armed Services Committee/gi,
        category: 'institution'
      },
      {
        regex: /Foreign Relations Committee/gi,
        category: 'institution'
      }
    ];

    // Extract specific entities first and map them
    specificNamePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        const fullMatch = match[0].trim();
        // Now we always use the full match since we removed capture groups
        const name = fullMatch;
        
        // Store for later reference resolution
        specificEntityMap.set(pattern.category, {name, category: pattern.category});
        
        entities.push({
          term: name,
          fullPhrase: fullMatch,
          startIndex: match.index,
          endIndex: match.index + fullMatch.length,
          category: pattern.category,
          description: `${pattern.category}: ${name}`
        });
      }
    });

    // Now find generic references and resolve them to specific entities
    const genericPatterns = [
      // Generic bill/legislation references
      {
        regex: /\b(this (?:bill|act|legislation|proposal|measure))\b/gi,
        category: 'bill',
        lookFor: 'bill'
      },
      {
        regex: /\b(the (?:bill|act|legislation|proposal|measure))\b/gi,
        category: 'bill',
        lookFor: 'bill'
      },
      {
        regex: /\b(that (?:bill|act|legislation|proposal|measure))\b/gi,
        category: 'bill',
        lookFor: 'bill'
      },
      {
        regex: /\b(such (?:bill|act|legislation|proposal|measure))\b/gi,
        category: 'bill',
        lookFor: 'bill'
      },
      {
        regex: /\b(this (?:spending bill|infrastructure bill|climate bill|healthcare bill|tax bill))\b/gi,
        category: 'bill',
        lookFor: 'bill'
      },
      // Generic department/agency references
      {
        regex: /\b(this (?:department|agency|bureau))\b/gi,
        category: 'department',
        lookFor: 'department'
      },
      {
        regex: /\b(the (?:department|agency|bureau))\b/gi,
        category: 'department',
        lookFor: 'department'
      },
      // Generic program references
      {
        regex: /\b(this (?:program|policy|initiative))\b/gi,
        category: 'program',
        lookFor: 'program'
      },
      {
        regex: /\b(the (?:program|policy|initiative))\b/gi,
        category: 'program',
        lookFor: 'program'
      }
    ];

    // Process generic references and link them to specific entities
    genericPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        const genericPhrase = match[1] ? match[1].trim() : match[0].trim();
        const specificEntity = specificEntityMap.get(pattern.lookFor);
        
        if (specificEntity) {
          entities.push({
            term: specificEntity.name,
            fullPhrase: genericPhrase,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            category: specificEntity.category,
            description: `${specificEntity.category}: ${specificEntity.name}`,
            specificName: specificEntity.name
          });
        }
      }
    });

    // Remove overlapping entities (keep the more specific one)
    const cleanedEntities = this.removeOverlappingEntities(entities);
    
    return cleanedEntities.sort((a, b) => a.startIndex - b.startIndex);
  }

  private removeOverlappingEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
    // Sort by start index, then by length (longer entities first)
    const sorted = entities.sort((a, b) => {
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      // If same start index, prefer longer entity
      return (b.endIndex - b.startIndex) - (a.endIndex - a.startIndex);
    });
    
    const result: ExtractedEntity[] = [];
    
    for (const entity of sorted) {
      // Check if this entity overlaps with any existing entity
      const hasOverlap = result.some(existing => 
        // Complete overlap (one entity is completely inside another)
        (entity.startIndex >= existing.startIndex && entity.endIndex <= existing.endIndex) ||
        (existing.startIndex >= entity.startIndex && existing.endIndex <= entity.endIndex) ||
        // Partial overlap
        (entity.startIndex < existing.endIndex && entity.endIndex > existing.startIndex)
      );
      
      if (!hasOverlap) {
        result.push(entity);
      } else {
        // If there's an overlap, check if this entity is longer than existing ones
        const overlappingEntities = result.filter(existing => 
          (entity.startIndex < existing.endIndex && entity.endIndex > existing.startIndex)
        );
        
        // If this entity is longer than any overlapping entity, replace them
        const entityLength = entity.endIndex - entity.startIndex;
        const shouldReplace = overlappingEntities.some(existing => 
          entityLength > (existing.endIndex - existing.startIndex)
        );
        
        if (shouldReplace) {
          // Remove overlapping entities
          overlappingEntities.forEach(overlapping => {
            const index = result.indexOf(overlapping);
            if (index > -1) {
              result.splice(index, 1);
            }
          });
          // Add this longer entity
          result.push(entity);
        }
      }
    }
    
    return result.sort((a, b) => a.startIndex - b.startIndex);
  }
}

// Export a configured instance
const getConfig = (): AIEntityExtractionConfig => {
  // Check if OpenAI API key is available
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo'
    };
  }
  
  // Check if Anthropic API key is available
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY
    };
  }
  
  // Fall back to improved pattern matching (no API required)
  return {
    provider: 'openai' // Will use improved patterns as fallback
  };
};

export const aiEntityExtractor = new AIEntityExtractor(getConfig());

export async function extractPoliticalEntitiesWithAI(text: string): Promise<ExtractedEntity[]> {
  return await aiEntityExtractor.extractPoliticalEntities(text);
}

export type { ExtractedEntity };