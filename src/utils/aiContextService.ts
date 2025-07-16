import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextData } from './politicalTerms';

// AI-powered context generation service
export class AIContextService {
  private cache: Map<string, ContextData> = new Map();
  
  async generateContextData(term: string): Promise<ContextData | null> {
    // Check cache first
    if (this.cache.has(term)) {
      return this.cache.get(term)!;
    }
    try {
      // Load OpenAI API key from storage
      const apiKey = await AsyncStorage.getItem('openai_api_key');
      if (apiKey) {
        const result = await this.generateContextWithOpenAI(term, apiKey);
        if (result) {
          this.cache.set(term, result);
          return result;
        }
      }
      // If no OpenAI or failed, return null (no local fallback)
      return null;
    } catch (error) {
      console.error('AI context generation failed:', error);
      return null;
    }
  }

  private async generateContextWithOpenAI(term: string, apiKey: string): Promise<ContextData | null> {
    try {
      // Generate each section separately for more control and accuracy
      const briefRundown = await this.generateSectionWithAI(term, apiKey, 'briefRundown');
      const components = await this.generateSectionWithAI(term, apiKey, 'components');
      const proposedImpact = await this.generateSectionWithAI(term, apiKey, 'proposedImpact');
      const inPracticeByStates = await this.generateSectionWithAI(term, apiKey, 'inPracticeByStates');
      const historicalUS = await this.generateSectionWithAI(term, apiKey, 'historicalUS');
      const otherCountries = await this.generateSectionWithAI(term, apiKey, 'otherCountries');

      if (!briefRundown) {
        throw new Error('Failed to generate basic context');
      }

      return {
        term: term,
        briefRundown: briefRundown as string,
        components: components as string[] || [],
        proposedImpact: proposedImpact as string || '',
        inPracticeByStates: inPracticeByStates as string[] || [],
        compareContrast: {
          historicalUS: historicalUS as string[] || [],
          otherCountries: otherCountries as string[] || []
        }
      };
    } catch (error) {
      console.error('OpenAI context generation failed:', error);
      return null;
    }
  }

  private async generateSectionWithAI(term: string, apiKey: string, section: string): Promise<string | string[] | null> {
    const prompts = {
      briefRundown: `Explain what "${term}" is in politics/government in 2-3 simple sentences. Be factual and non-partisan.`,
      components: `List 3-4 key components or parts of "${term}" in politics. Return as a JSON array of strings, each 2-3 sentences.`,
      proposedImpact: `Explain the intended impact or purpose of "${term}" in 2-3 sentences.`,
      inPracticeByStates: `Give 3-4 examples of how "${term}" varies or is implemented differently by states. Return as a JSON array of strings, each 2-3 sentences.`,
      historicalUS: `List 2-3 similar historical programs/policies in US history related to "${term}". Return as a JSON array of strings, each 2-3 sentences.`,
      otherCountries: `List 2-3 examples of how other countries handle something similar to "${term}". Return as a JSON array of strings, each 2-3 sentences.`
    };

    const isArrayResponse = ['components', 'inPracticeByStates', 'historicalUS', 'otherCountries'].includes(section);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: isArrayResponse 
                ? 'You are a political expert. Return only a valid JSON array of strings. Each string should be 2-3 sentences.'
                : 'You are a political expert. Return only the requested text, no extra formatting or explanations.'
            },
            {
              role: 'user',
              content: prompts[section as keyof typeof prompts]
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) {
        return null;
      }

      if (isArrayResponse) {
        try {
          const cleanedContent = content.replace(/```json\n?|```\n?/g, '');
          const parsed = JSON.parse(cleanedContent);
          return Array.isArray(parsed) ? parsed : null;
        } catch {
          // If JSON parsing fails, try to split by lines
          return content.split('\n').filter(line => line.trim()).slice(0, 4);
        }
      } else {
        return content.replace(/```json\n?|```\n?/g, '');
      }
    } catch (error) {
      console.error(`Failed to generate ${section} for ${term}:`, error);
      return null;
    }
  }

  private validateContextData(data: any): boolean {
    return (
      data &&
      typeof data.term === 'string' &&
      typeof data.briefRundown === 'string' &&
      Array.isArray(data.components) &&
      typeof data.proposedImpact === 'string' &&
      Array.isArray(data.inPracticeByStates) &&
      data.compareContrast &&
      Array.isArray(data.compareContrast.historicalUS) &&
      Array.isArray(data.compareContrast.otherCountries)
    );
  }

  private async generateEnhancedLocalContext(term: string): Promise<ContextData> {
    // Generate simple, specific responses based on the term
    const termLower = term.toLowerCase();
    
    // Create specific context based on the actual term
    return {
      term: term,
      briefRundown: this.generateSpecificBriefRundown(term),
      components: this.generateSpecificComponents(term),
      proposedImpact: this.generateSpecificImpact(term),
      inPracticeByStates: this.generateSpecificStateInfo(term),
      compareContrast: {
        historicalUS: this.generateSpecificHistoricalUS(term),
        otherCountries: this.generateSpecificOtherCountries(term)
      }
    };
  }

  private isGovernmentAgency(term: string): boolean {
    return /\b(department|agency|administration|bureau|office|commission|service|epa|fbi|cia|dhs|doj|fda|cdc|irs|ice|tsa|dea|atf)\b/.test(term);
  }

  private isLegislation(term: string): boolean {
    return /\b(act|bill|law|code|reform|regulation|directive|h\.?r\.?\s*\d+|s\.?\s*\d+)\b/.test(term);
  }

  private isPoliticalInstitution(term: string): boolean {
    return /\b(senate|house|congress|supreme court|federal reserve|electoral college|committee)\b/.test(term);
  }

  private isPoliticalMovement(term: string): boolean {
    return /\b(maga|tea party|black lives matter|make america great again|movement)\b/.test(term);
  }

  private isEconomicPolicy(term: string): boolean {
    return /\b(tariff|trade|economic|fiscal|monetary|budget|tax|social security|medicare|medicaid)\b/.test(term);
  }

  private generateSpecificBriefRundown(term: string): string {
    const termLower = term.toLowerCase();
    
    // Specific explanations for common terms
    const specificExplanations: Record<string, string> = {
      'ice': 'ICE (Immigration and Customs Enforcement) is a federal law enforcement agency under the Department of Homeland Security. It enforces immigration and customs laws within the United States. ICE was created in 2003 as part of the government reorganization following 9/11.',
      
      'maga': 'MAGA (Make America Great Again) is a political slogan and movement associated with Donald Trump\'s presidency and political campaigns. The slogan emphasizes American nationalism and populist policies. It became a rallying cry for Trump supporters and conservative political activism.',
      
      'trump administration': 'The Trump Administration refers to the executive branch of the U.S. government during Donald Trump\'s presidency from 2017 to 2021. It implemented policies focused on immigration restrictions, deregulation, and "America First" foreign policy. The administration was marked by significant political polarization and policy changes.',
      
      'biden administration': 'The Biden Administration refers to the current executive branch under President Joe Biden, beginning in January 2021. It has focused on COVID-19 response, climate change, infrastructure investment, and restoring traditional diplomatic relationships. The administration represents a shift toward more progressive domestic policies.',
      
      'house energy and commerce committee': 'The House Energy and Commerce Committee is one of the oldest and most powerful committees in the U.S. House of Representatives. It has broad jurisdiction over energy, healthcare, telecommunications, and consumer protection issues. The committee plays a crucial role in shaping major legislation affecting American consumers and businesses.',
      
      'senate': 'The U.S. Senate is the upper chamber of Congress, with 100 members serving six-year terms. Each state elects two senators regardless of population size. The Senate has unique powers including confirming presidential appointments and trying impeachment cases.',
      
      'house of representatives': 'The U.S. House of Representatives is the lower chamber of Congress with 435 members serving two-year terms. Representation is based on state population as determined by the census. The House has the exclusive power to initiate revenue bills and impeach federal officials.'
    };
    
    if (specificExplanations[termLower]) {
      return specificExplanations[termLower];
    }
    
    // Generic explanation for unknown terms
    return `${term} is a political term or entity that plays a role in American government and policy-making. Understanding this term helps citizens better comprehend how government functions and how policy decisions are made. This concept is part of the broader framework of American democracy and governance.`;
  }

  private generateSpecificComponents(term: string): string[] {
    const termLower = term.toLowerCase();
    
    const specificComponents: Record<string, string[]> = {
      'ice': [
        'Enforcement and Removal Operations (ERO) - handles deportation and detention of undocumented immigrants',
        'Homeland Security Investigations (HSI) - investigates transnational crimes including human trafficking and drug smuggling',
        'Office of the Principal Legal Advisor - provides legal counsel and represents ICE in immigration proceedings',
        'Management and Administration - oversees budget, personnel, and operational support across the agency'
      ],
      
      'maga': [
        'Political messaging and branding that emphasizes American nationalism and traditional values',
        'Grassroots supporter network organizing rallies, social media campaigns, and local political activities',
        'Policy agenda focusing on immigration restrictions, trade protectionism, and deregulation',
        'Electoral strategy targeting working-class voters and rural communities disaffected by globalization'
      ],
      
      'trump administration': [
        'Executive departments and agencies led by Trump-appointed secretaries and administrators',
        'White House staff including chief of staff, senior advisors, and communications team',
        'Judicial appointments including three Supreme Court justices and numerous federal judges',
        'Policy implementation through executive orders, regulatory changes, and congressional legislation'
      ],
      
      'house energy and commerce committee': [
        'Energy Subcommittee - oversees energy production, distribution, and regulatory policy',
        'Health Subcommittee - handles healthcare policy, FDA oversight, and public health issues',
        'Communications and Technology Subcommittee - regulates telecommunications, internet policy, and media',
        'Consumer Protection Subcommittee - focuses on product safety, data privacy, and consumer rights'
      ]
    };
    
    if (specificComponents[termLower]) {
      return specificComponents[termLower];
    }
    
    return [
      `Key organizational or structural elements that define how ${term} operates`,
      `Primary functions and responsibilities associated with ${term}`,
      `Important stakeholders or groups involved in ${term}`,
      `Processes or mechanisms through which ${term} achieves its objectives`
    ];
  }

  private generateSpecificImpact(term: string): string {
    const termLower = term.toLowerCase();
    
    const specificImpacts: Record<string, string> = {
      'ice': 'ICE aims to protect national security and public safety by enforcing immigration laws and investigating transnational crimes. Its operations directly affect immigrant communities through deportation enforcement and detention. The agency\'s activities are designed to maintain border security and uphold federal immigration policy.',
      
      'maga': 'The MAGA movement seeks to reshape American politics by promoting nationalist policies and challenging establishment institutions. It aims to restore what supporters view as traditional American values and economic priorities. The movement has significantly influenced Republican Party politics and conservative political discourse.',
      
      'trump administration': 'The Trump Administration implemented significant policy changes in immigration, trade, healthcare, and foreign relations. It aimed to reduce government regulation, strengthen border security, and prioritize American economic interests. The administration\'s policies continue to influence political debates and policy discussions.',
      
      'house energy and commerce committee': 'The committee shapes major legislation affecting healthcare, energy policy, telecommunications, and consumer protection. Its decisions impact millions of Americans through healthcare access, energy costs, and digital privacy rights. The committee serves as a key venue for addressing emerging technologies and public health challenges.'
    };
    
    if (specificImpacts[termLower]) {
      return specificImpacts[termLower];
    }
    
    return `${term} is designed to influence policy outcomes and governmental processes in ways that affect American citizens and institutions. The intended impact involves addressing specific challenges or advancing particular goals within the political system.`;
  }

  private generateSpecificStateInfo(term: string): string[] {
    const termLower = term.toLowerCase();
    
    const specificStateInfo: Record<string, string[]> = {
      'ice': [
        'ICE operates field offices in major cities across all states, with larger operations in border states like Texas, California, and Arizona',
        'Sanctuary cities and states have policies limiting cooperation with ICE enforcement activities',
        'Some states have enacted laws restricting local law enforcement cooperation with ICE operations',
        'Immigration detention facilities are located in various states, often in rural areas with federal contracts'
      ],
      
      'maga': [
        'MAGA support is strongest in rural states and regions that experienced economic decline from globalization',
        'Different states show varying levels of MAGA movement influence in Republican primaries and general elections',
        'Some states have implemented policies aligned with MAGA priorities like immigration enforcement and election security',
        'Urban areas and coastal states generally show less support for MAGA policies and candidates'
      ],
      
      'trump administration': [
        'Red states generally supported Trump administration policies while blue states often challenged them in federal court',
        'Immigration enforcement varied significantly between sanctuary states and states that cooperated with federal authorities',
        'Environmental regulations were implemented differently based on state political leadership and priorities',
        'COVID-19 response highlighted tensions between federal guidance and state-level policy decisions'
      ]
    };
    
    if (specificStateInfo[termLower]) {
      return specificStateInfo[termLower];
    }
    
    return [
      `Implementation of ${term} varies across states based on local political priorities and resources`,
      `Some states may have different approaches to ${term} based on their political leadership`,
      `Federal and state coordination regarding ${term} may differ depending on political alignment`,
      `Regional differences in how ${term} affects local communities and economies`
    ];
  }

  private generateSpecificHistoricalUS(term: string): string[] {
    const termLower = term.toLowerCase();
    
    const specificHistorical: Record<string, string[]> = {
      'ice': [
        'Immigration and Naturalization Service (INS) - the predecessor agency that handled immigration enforcement before 2003',
        'Border Patrol - established in 1924 to prevent illegal entry, now part of Customs and Border Protection',
        'U.S. Customs Service - historical agency that merged with immigration functions to create current homeland security structure'
      ],
      
      'maga': [
        'America First movement of the 1940s that opposed U.S. involvement in World War II',
        'Populist movements like those led by William Jennings Bryan that challenged established political elites',
        'Tea Party movement of 2009-2012 that promoted conservative fiscal policies and challenged Republican establishment'
      ],
      
      'trump administration': [
        'Previous Republican administrations like Reagan and Bush that promoted conservative economic policies',
        'Populist presidents like Andrew Jackson who challenged political establishments and promoted common man politics',
        'Nixon administration which also faced significant political polarization and controversy'
      ]
    };
    
    if (specificHistorical[termLower]) {
      return specificHistorical[termLower];
    }
    
    return [
      `Historical precedents in American politics that share similarities with ${term}`,
      `Previous policies or institutions that addressed similar challenges to ${term}`,
      `Earlier political movements or developments that influenced the creation of ${term}`
    ];
  }

  private generateSpecificOtherCountries(term: string): string[] {
    const termLower = term.toLowerCase();
    
    const specificOtherCountries: Record<string, string[]> = {
      'ice': [
        'UK Border Force - handles immigration enforcement and border security in the United Kingdom',
        'Canada Border Services Agency - manages immigration enforcement and customs in Canada',
        'European Border and Coast Guard Agency (Frontex) - coordinates border security across European Union member states'
      ],
      
      'maga': [
        'Brexit movement in the UK that promoted British nationalism and withdrawal from the European Union',
        'France\'s National Rally party that advocates for French nationalism and immigration restrictions',
        'Alternative for Germany (AfD) which promotes German nationalism and opposition to immigration'
      ],
      
      'trump administration': [
        'Bolsonaro administration in Brazil that promoted similar nationalist and populist policies',
        'Modi government in India that has emphasized Hindu nationalism and economic nationalism',
        'Orbán government in Hungary that has implemented nationalist policies and challenged EU institutions'
      ]
    };
    
    if (specificOtherCountries[termLower]) {
      return specificOtherCountries[termLower];
    }
    
    return [
      `Similar institutions or policies in other democratic countries that serve comparable functions to ${term}`,
      `International examples of how other nations address challenges similar to those handled by ${term}`,
      `Different approaches used by other countries that contrast with the American approach to ${term}`
    ];
  }



  // Clear cache for memory management
  clearCache() {
    this.cache.clear();
  }
}

// Export configured instance
export const aiContextService = new AIContextService();

// Export main function
export async function generateAIContext(term: string): Promise<ContextData | null> {
  return await aiContextService.generateContextData(term);
}