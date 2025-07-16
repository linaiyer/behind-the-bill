export interface PoliticalTerm {
  term: string;
  category: 'policy' | 'program' | 'law' | 'institution' | 'concept' | 'position';
  aliases: string[];
}

export interface ContextData {
  term: string;
  briefRundown: string;
  components?: string[];
  proposedImpact?: string;
  inPracticeByStates?: string[];
  compareContrast?: {
    historicalUS?: string[];
    otherCountries?: string[];
  };
}

// Comprehensive list of political terms to detect
export const POLITICAL_TERMS: PoliticalTerm[] = [
  // Healthcare
  { term: "Medicare", category: "program", aliases: ["medicare", "Medicare program"] },
  { term: "Medicaid", category: "program", aliases: ["medicaid", "Medicaid program"] },
  { term: "Affordable Care Act", category: "law", aliases: ["ACA", "Obamacare", "affordable care act"] },
  { term: "Universal Healthcare", category: "policy", aliases: ["universal healthcare", "universal health care", "single payer"] },
  
  // Economic Policy
  { term: "Social Security", category: "program", aliases: ["social security", "Social Security program"] },
  { term: "Federal Reserve", category: "institution", aliases: ["federal reserve", "Fed", "the Fed", "Federal Reserve Bank"] },
  { term: "Minimum Wage", category: "policy", aliases: ["minimum wage", "federal minimum wage"] },
  { term: "Tax Reform", category: "policy", aliases: ["tax reform", "tax overhaul", "tax changes"] },
  { term: "Infrastructure", category: "policy", aliases: ["infrastructure", "infrastructure spending", "public works"] },
  
  // Education
  { term: "Student Loans", category: "program", aliases: ["student loans", "federal student loans", "student debt"] },
  { term: "Title IX", category: "law", aliases: ["title ix", "Title 9"] },
  { term: "No Child Left Behind", category: "law", aliases: ["no child left behind", "NCLB"] },
  
  // Immigration
  { term: "DACA", category: "program", aliases: ["daca", "Deferred Action for Childhood Arrivals"] },
  { term: "Border Security", category: "policy", aliases: ["border security", "border wall", "immigration enforcement"] },
  { term: "Green Card", category: "concept", aliases: ["green card", "permanent residence", "legal permanent resident"] },
  
  // Climate & Environment
  { term: "Paris Climate Agreement", category: "law", aliases: ["paris climate agreement", "paris accord", "climate accord"] },
  { term: "Carbon Tax", category: "policy", aliases: ["carbon tax", "carbon pricing"] },
  { term: "Green New Deal", category: "policy", aliases: ["green new deal", "GND"] },
  
  // Justice & Rights
  { term: "Second Amendment", category: "law", aliases: ["second amendment", "2nd amendment", "right to bear arms"] },
  { term: "First Amendment", category: "law", aliases: ["first amendment", "1st amendment", "freedom of speech"] },
  { term: "Civil Rights", category: "concept", aliases: ["civil rights", "civil liberties"] },
  { term: "Voting Rights", category: "concept", aliases: ["voting rights", "voter rights", "election rights"] },
  
  // Government Structure
  { term: "Electoral College", category: "institution", aliases: ["electoral college", "electoral votes"] },
  { term: "Senate", category: "institution", aliases: ["senate", "U.S. Senate", "upper chamber"] },
  { term: "House of Representatives", category: "institution", aliases: ["house of representatives", "house", "lower chamber"] },
  { term: "Supreme Court", category: "institution", aliases: ["supreme court", "SCOTUS"] },
  { term: "Filibuster", category: "concept", aliases: ["filibuster", "senate filibuster"] },
  
  // Budget & Spending
  { term: "National Debt", category: "concept", aliases: ["national debt", "federal debt", "government debt"] },
  { term: "Budget Deficit", category: "concept", aliases: ["budget deficit", "fiscal deficit"] },
  { term: "Government Shutdown", category: "concept", aliases: ["government shutdown", "federal shutdown"] },
  
  // Trade & Foreign Policy
  { term: "NAFTA", category: "law", aliases: ["nafta", "North American Free Trade Agreement"] },
  { term: "NATO", category: "institution", aliases: ["nato", "North Atlantic Treaty Organization"] },
  { term: "Tariffs", category: "policy", aliases: ["tariffs", "trade tariffs", "import taxes"] },
  
  // Government Institutions (keep these as they're specific)
  { term: "Congress", category: "institution", aliases: ["congress", "U.S. Congress", "legislative branch"] },
  { term: "Senate", category: "institution", aliases: ["senate", "U.S. Senate", "upper chamber"] },
  { term: "House of Representatives", category: "institution", aliases: ["house of representatives", "house", "lower chamber"] },
  { term: "Supreme Court", category: "institution", aliases: ["supreme court", "SCOTUS"] },
  { term: "Federal Reserve", category: "institution", aliases: ["federal reserve", "Fed", "the Fed", "Federal Reserve Bank"] },
  { term: "Electoral College", category: "institution", aliases: ["electoral college", "electoral votes"] },
];

// Function to detect political terms in text
export function detectPoliticalTerms(text: string): Array<{term: string, startIndex: number, endIndex: number}> {
  const detectedTerms: Array<{term: string, startIndex: number, endIndex: number}> = [];
  const textLower = text.toLowerCase();
  
  POLITICAL_TERMS.forEach(politicalTerm => {
    // Check the main term and all aliases, but prioritize longer terms first
    const termsToCheck = [politicalTerm.term, ...politicalTerm.aliases]
      .sort((a, b) => b.length - a.length); // Sort by length descending
    
    termsToCheck.forEach(termVariant => {
      const termLower = termVariant.toLowerCase();
      let searchIndex = 0;
      
      while (true) {
        const index = textLower.indexOf(termLower, searchIndex);
        if (index === -1) break;
        
        // Check if it's a whole word (not part of another word)
        const charBefore = index > 0 ? textLower[index - 1] : ' ';
        const charAfter = index + termLower.length < textLower.length ? textLower[index + termLower.length] : ' ';
        
        const isWholeWord = (
          /[\s\.,!?;:\-\(\)\[\]\"\'`]/.test(charBefore) &&
          /[\s\.,!?;:\-\(\)\[\]\"\'`]/.test(charAfter)
        );
        
        if (isWholeWord) {
          // Check if this term overlaps with an already detected term
          const overlaps = detectedTerms.some(detected => 
            (index >= detected.startIndex && index < detected.endIndex) ||
            (index + termLower.length > detected.startIndex && index + termLower.length <= detected.endIndex) ||
            (index <= detected.startIndex && index + termLower.length >= detected.endIndex)
          );
          
          if (!overlaps) {
            detectedTerms.push({
              term: politicalTerm.term, // Use the canonical term name
              startIndex: index,
              endIndex: index + termLower.length
            });
          }
        }
        
        searchIndex = index + 1;
      }
    });
  });
  
  // Sort by start index to maintain text order and remove overlaps
  return detectedTerms
    .sort((a, b) => a.startIndex - b.startIndex)
    .filter((term, index, array) => {
      // Remove any terms that are completely contained within another term
      return !array.some((otherTerm, otherIndex) => 
        otherIndex !== index &&
        otherTerm.startIndex <= term.startIndex &&
        otherTerm.endIndex >= term.endIndex
      );
    });
}

// AI-powered political entity detection
export async function detectPoliticalEntitiesWithAI(text: string): Promise<Array<{term: string, fullPhrase: string, startIndex: number, endIndex: number, category: string}>> {
  try {
    const prompt = `Analyze the following text and identify specific political entities, bill names, policy references, and government programs. Focus on:

1. Specific bill names (e.g., "Infrastructure Investment and Jobs Act", "Big Beautiful Bill")
2. Named policies and programs (e.g., "Medicare for All", "Green New Deal")
3. Government departments and agencies (e.g., "Department of Education", "EPA")
4. Specific laws and acts (e.g., "Affordable Care Act", "USA PATRIOT Act")
5. Government institutions (but not generic titles like "president")

For each entity found, return:
- term: The canonical name of the entity
- fullPhrase: The exact phrase as it appears in the text
- category: One of "bill", "policy", "department", "law", "institution", "program"

Text to analyze:
"${text}"

Return as JSON array format: [{"term": "name", "fullPhrase": "exact text", "category": "type"}]

Do not include generic words like "president", "government", "policy" unless they are part of a specific named entity.`;

    // In a real implementation, you would call an AI API here
    // For now, we'll simulate the response based on common patterns
    return await simulateAIPoliticalDetection(text);
  } catch (error) {
    console.error('Failed to detect political entities with AI:', error);
    return [];
  }
}

// Simulate AI-powered political entity detection
async function simulateAIPoliticalDetection(text: string): Promise<Array<{term: string, fullPhrase: string, startIndex: number, endIndex: number, category: string}>> {
  // This is a sophisticated pattern-based detection that simulates AI behavior
  const entities: Array<{term: string, fullPhrase: string, startIndex: number, endIndex: number, category: string}> = [];
  
  // Patterns for different types of political entities
  const patterns = [
    // Bill patterns
    {
      regex: /\b([A-Z][a-z]+ [A-Z][a-z]+ (?:Bill|Act))\b/gi,
      category: 'bill'
    },
    {
      regex: /\bthe ([A-Z][A-Za-z\s]+(?:Bill|Act))\b/gi,
      category: 'bill'
    },
    {
      regex: /\b([A-Z][A-Za-z]+ [A-Z][A-Za-z]+ [A-Z][A-Za-z]+ (?:Bill|Act))\b/gi,
      category: 'bill'
    },
    {
      regex: /\b(Big Beautiful Bill|Infrastructure Bill|Climate Bill|Healthcare Bill)\b/gi,
      category: 'bill'
    },
    {
      regex: /\b(H\.R\.\s*\d+|S\.\s*\d+)\b/gi,
      category: 'bill'
    },
    
    // Department patterns
    {
      regex: /\b(Department of [A-Z][A-Za-z\s]+)\b/gi,
      category: 'department'
    },
    {
      regex: /\b(EPA|FDA|CDC|FBI|CIA|NSA|DOD|DOE|HHS)\b/g,
      category: 'department'
    },
    
    // Specific policy programs
    {
      regex: /\b(Medicare for All|Green New Deal|Social Security|Medicare|Medicaid)\b/gi,
      category: 'program'
    },
    
    // Laws and Acts (specific named ones)
    {
      regex: /\b([A-Z][A-Za-z\s]+ Act of \d{4})\b/gi,
      category: 'law'
    },
    {
      regex: /\b(Affordable Care Act|USA PATRIOT Act|Civil Rights Act|Americans with Disabilities Act)\b/gi,
      category: 'law'
    },
    
    // Institutions (specific ones)
    {
      regex: /\b(Federal Reserve|Supreme Court|Congress|Senate|House of Representatives|NATO|UN|United Nations)\b/gi,
      category: 'institution'
    }
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const fullPhrase = match[0];
      const term = match[1] || match[0];
      const startIndex = match.index;
      const endIndex = match.index + fullPhrase.length;
      
      // Avoid duplicates
      const isDuplicate = entities.some(entity => 
        entity.startIndex === startIndex && entity.endIndex === endIndex
      );
      
      if (!isDuplicate) {
        entities.push({
          term: term.trim(),
          fullPhrase: fullPhrase.trim(),
          startIndex,
          endIndex,
          category: pattern.category
        });
      }
    }
  });
  
  // Sort by start index
  return entities.sort((a, b) => a.startIndex - b.startIndex);
}

// Function to generate context data using AI
async function generateContextWithAI(term: string): Promise<ContextData | null> {
  try {
    // Use the new AI context service for comprehensive context generation
    const { generateAIContext } = await import('./aiContextService');
    return await generateAIContext(term);
  } catch (error) {
    console.error('Failed to generate AI context:', error);
    // Fallback to simulation if AI service fails
    return await simulateAIResponse(term);
  }
}

// Simulate AI response (in production, replace with actual AI API call)
async function simulateAIResponse(term: string): Promise<ContextData | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate basic context for common terms
  const termLower = term.toLowerCase();
  
  if (termLower.includes('federal reserve') || termLower.includes('fed')) {
    return {
      term: "Federal Reserve",
      briefRundown: "The Federal Reserve is the central banking system of the United States, responsible for conducting monetary policy, supervising banks, and maintaining financial stability. It was established in 1913 to provide the country with a safe, flexible, and stable monetary and financial system.",
      components: [
        "Board of Governors - Seven-member board appointed by the President",
        "Federal Open Market Committee (FOMC) - Sets monetary policy and interest rates",
        "12 Regional Federal Reserve Banks - Serve different geographic regions",
        "Member Banks - Private banks that are part of the Federal Reserve System"
      ],
      proposedImpact: "Maintains price stability, full employment, and moderate long-term interest rates while supervising the banking system to ensure financial stability and consumer protection.",
      inPracticeByStates: [
        "Each of the 12 Federal Reserve districts serves multiple states",
        "Regional Fed banks provide banking services to local financial institutions",
        "Economic data and research varies by region to reflect local conditions"
      ],
      compareContrast: {
        historicalUS: [
          "First Bank of the United States (1791-1811) - early attempt at central banking",
          "Second Bank of the United States (1816-1836) - predecessor central bank",
          "National Banking System (1863-1913) - precursor to modern banking regulation"
        ],
        otherCountries: [
          "European Central Bank - manages monetary policy for eurozone countries",
          "Bank of England - UK's central bank, established in 1694",
          "Bank of Japan - Japan's central bank with similar monetary policy functions"
        ]
      }
    };
  }
  
  // For other terms, generate a basic response
  return {
    term: term,
    briefRundown: `${term} is an important political concept that plays a significant role in governance and policy-making. This term encompasses various aspects of political processes and institutional frameworks that shape how decisions are made and implemented in democratic societies.`,
    proposedImpact: `${term} is designed to influence policy outcomes, institutional effectiveness, and democratic processes in ways that serve the public interest and maintain governmental accountability.`,
  };
}

// New highlighting algorithm based on specific searchable policy/political terms
export interface HighlightedTerm {
  term: string;
  fullPhrase: string;
  startIndex: number;
  endIndex: number;
  category: string;
}

export function detectSpecificPoliticalTerms(text: string): HighlightedTerm[] {
  const detectedTerms: HighlightedTerm[] = [];
  
  // 1. BILL IDENTIFIERS
  const billIdentifierPatterns = [
    {
      regex: /\b(?:H\.?\s?R\.?|S\.?B\.?|S\.?|AB|HB|SB)\s?\d{1,5}\b/gi,
      category: 'bill_identifier'
    },
    {
      regex: /\b(?:EU|UK|US)\s+(?:Regulation|Directive)\s+\d{4}\/\d+\b/gi,
      category: 'bill_identifier'
    }
  ];
  
  // 2. FORMAL LEGISLATION NAMES (capitalized phrases ending in Act|Bill|Law|Code|Reform|Regulation|Directive)
  const formalLegislationPattern = {
    regex: /\b([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*\s+(?:Act|Bill|Law|Code|Reform|Regulation|Directive))\b/g,
    category: 'formal_legislation'
  };
  
  // 3. GOVERNMENT AGENCIES / PROGRAMS / THINK-TANKS
  const agencyProgramPatterns = [
    {
      regex: /\b(?:Department\s+of\s+[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)+)/g,
      category: 'government_agency'
    },
    {
      regex: /\b[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*\s+(?:Department|Agency|Administration|Office|Commission|Service|Bureau|Foundation|Institute|Center|Program)\b/g,
      category: 'government_agency'
    }
  ];
  
  // 4. MAJOR ENTITLEMENT / POLICY PROGRAMS & ACRONYMS (exact list, case-insensitive)
  const entitlementPrograms = [
    'Medicaid', 'Medicare', 'CHIP', 'Social Security', 'SNAP', 
    'Supplemental Nutrition Assistance Program', 'TANF', 'WIC',
    'Affordable Care Act', 'ACA', 'PEPFAR', 'FEMA'
  ];
  
  // 5. POLITICAL INSTITUTIONS & COMMITTEES
  const institutionPatterns = [
    {
      // Legislative bodies & branches
      regex: /\b(?:U\.?S\.?\s+)?(?:Senate|House(?:\s+of\s+Representatives)?|Congress|Legislature|legislative\s+branch)\b/gi,
      category: 'political_institution'
    },
    {
      // Committees (capitalized phrase ending in Committee)
      regex: /\b[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*\s+Committee\b/g,
      category: 'political_institution'
    },
    {
      // Party names & abbreviations
      regex: /\b(?:Republican\s+Party|Democratic\s+Party|Republicans?|Democrats?|G\.?O\.?P\.?)\b/gi,
      category: 'political_institution'
    }
  ];
  
  // 6. SPECIAL POLICY PHRASES (case-insensitive)
  const specialPolicyPhrases = [
    'rescissions bill',
    'continuing resolution', 
    'omnibus spending package'
  ];
  
  // Helper function to add terms while avoiding overlaps
  function addTermIfNoOverlap(newTerm: HighlightedTerm) {
    const hasOverlap = detectedTerms.some(existing => 
      (newTerm.startIndex < existing.endIndex && newTerm.endIndex > existing.startIndex)
    );
    
    if (!hasOverlap) {
      detectedTerms.push(newTerm);
    }
  }
  
  // Process all patterns
  
  // 1. Bill identifiers
  billIdentifierPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      addTermIfNoOverlap({
        term: match[0].trim(),
        fullPhrase: match[0].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        category: pattern.category
      });
    }
  });
  
  // 2. Formal legislation names
  let match;
  while ((match = formalLegislationPattern.regex.exec(text)) !== null) {
    addTermIfNoOverlap({
      term: match[1].trim(),
      fullPhrase: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      category: formalLegislationPattern.category
    });
  }
  
  // 3. Government agencies/programs/think-tanks
  agencyProgramPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      addTermIfNoOverlap({
        term: match[0].trim(),
        fullPhrase: match[0].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        category: pattern.category
      });
    }
  });
  
  // 4. Entitlement programs (exact matches, case-insensitive)
  entitlementPrograms.forEach(program => {
    const regex = new RegExp(`\\b${program.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      addTermIfNoOverlap({
        term: program,
        fullPhrase: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        category: 'entitlement_program'
      });
    }
  });
  
  // 5. Political institutions
  institutionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      addTermIfNoOverlap({
        term: match[0].trim(),
        fullPhrase: match[0].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        category: pattern.category
      });
    }
  });
  
  // 6. Special policy phrases (case-insensitive exact matches)
  specialPolicyPhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      addTermIfNoOverlap({
        term: phrase,
        fullPhrase: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        category: 'special_policy_phrase'
      });
    }
  });
  
  // Sort by start index and remove any remaining overlaps
  return detectedTerms
    .sort((a, b) => a.startIndex - b.startIndex)
    .filter((term, index, array) => {
      // Remove terms completely contained within another term
      return !array.some((otherTerm, otherIndex) => 
        otherIndex !== index &&
        otherTerm.startIndex <= term.startIndex &&
        otherTerm.endIndex >= term.endIndex
      );
    });
}

// Function to get context data for a political term
export async function getContextData(term: string): Promise<ContextData | null> {
  // First, resolve aliases to canonical term
  let canonicalTerm = term;
  for (const entry of POLITICAL_TERMS) {
    if (entry.term.toLowerCase() === term.toLowerCase() || entry.aliases.map(a => a.toLowerCase()).includes(term.toLowerCase())) {
      canonicalTerm = entry.term;
      break;
    }
  }
  // First, check our static database for detailed information
  const contextDatabase: Record<string, ContextData> = {
    "Medicare": {
      term: "Medicare",
      briefRundown: "Medicare is a federal health insurance program primarily for Americans 65 and older, as well as some younger people with disabilities. It provides hospital insurance, medical insurance, and prescription drug coverage.",
      components: [
        "Part A: Hospital Insurance - covers inpatient hospital stays, skilled nursing facility care, hospice care, and some home health care",
        "Part B: Medical Insurance - covers certain doctors' services, outpatient care, medical supplies, and preventive services",
        "Part C: Medicare Advantage - alternative way to receive Medicare benefits through private insurance companies",
        "Part D: Prescription Drug Coverage - helps cover the cost of prescription drugs"
      ],
      proposedImpact: "Provides healthcare security for seniors and disabled Americans, reducing financial barriers to essential medical care and prescription medications.",
      inPracticeByStates: [
        "All 50 states participate in Medicare as it's a federal program",
        "Some states supplement Medicare with additional programs",
        "Medicare Advantage enrollment varies significantly by state"
      ],
      compareContrast: {
        historicalUS: [
          "Social Security (1935) - established federal safety net precedent",
          "Medicaid (1965) - companion program for low-income individuals",
          "Veterans Administration healthcare - government-provided healthcare for veterans"
        ],
        otherCountries: [
          "Canada's Medicare - universal single-payer system for all citizens",
          "UK's NHS - government-owned and operated healthcare system",
          "Germany's statutory health insurance - multi-payer universal system"
        ]
      }
    },
    "Social Security": {
      term: "Social Security",
      briefRundown: "Social Security is a federal program that provides retirement, disability, and survivor benefits to eligible Americans. It's funded through payroll taxes and serves as a critical safety net for millions of Americans.",
      components: [
        "Old-Age Insurance - retirement benefits for workers and spouses",
        "Disability Insurance - benefits for workers who become disabled",
        "Survivor Benefits - benefits for family members of deceased workers",
        "Supplemental Security Income (SSI) - needs-based program for elderly, blind, or disabled individuals"
      ],
      proposedImpact: "Provides economic security in retirement, disability, or death of a family breadwinner, reducing poverty among elderly and disabled Americans.",
      inPracticeByStates: [
        "Federal program administered uniformly across all states",
        "Benefit amounts vary based on earnings history and cost of living",
        "Some states tax Social Security benefits while others don't"
      ],
      compareContrast: {
        historicalUS: [
          "Corporate pension systems - employer-sponsored retirement benefits",
          "401(k) plans - individual retirement savings accounts",
          "Railroad Retirement - separate federal retirement system for railroad workers"
        ],
        otherCountries: [
          "Canada Pension Plan - similar earnings-based pension system",
          "Germany's pension system - three-pillar approach with statutory, occupational, and private pensions",
          "Australia's superannuation - mandatory employer contributions to retirement accounts"
        ]
      }
    },
    "Affordable Care Act": {
      term: "Affordable Care Act",
      briefRundown: "The Affordable Care Act (ACA), also known as Obamacare, is a comprehensive healthcare reform law enacted in 2010. It aims to increase health insurance coverage, reduce healthcare costs, and improve healthcare quality.",
      components: [
        "Individual Mandate - requirement for most Americans to have health insurance or pay a penalty",
        "Health Insurance Marketplaces - online exchanges where individuals can shop for insurance",
        "Medicaid Expansion - extends Medicaid eligibility to more low-income adults",
        "Essential Health Benefits - minimum standards for health insurance coverage",
        "Pre-existing Conditions Protection - insurers cannot deny coverage or charge more for pre-existing conditions"
      ],
      proposedImpact: "Expand healthcare access to millions of uninsured Americans, control healthcare costs, and improve quality of care through various reforms and regulations.",
      inPracticeByStates: [
        "39 states + DC have expanded Medicaid under the ACA",
        "12 states have not expanded Medicaid, creating coverage gaps",
        "Some states run their own marketplaces while others use the federal marketplace"
      ],
      compareContrast: {
        historicalUS: [
          "Medicare and Medicaid (1965) - previous major federal healthcare expansions",
          "COBRA (1985) - continuation of employer health coverage",
          "CHIP (1997) - children's health insurance program"
        ],
        otherCountries: [
          "Switzerland's healthcare system - universal coverage through regulated private insurance",
          "Netherlands' healthcare reform (2006) - similar insurance marketplace model",
          "Massachusetts healthcare reform (2006) - state-level model that influenced the ACA"
        ]
      }
    },
    "Department of Justice": {
      term: "Department of Justice",
      briefRundown: "The Department of Justice (DOJ) is the federal executive department responsible for enforcing federal law and administering justice in the United States. Led by the Attorney General, it oversees federal law enforcement agencies and prosecutes federal crimes.",
      components: [
        "FBI - Federal Bureau of Investigation handles domestic intelligence and security",
        "DEA - Drug Enforcement Administration combats drug trafficking",
        "ATF - Bureau of Alcohol, Tobacco, Firearms and Explosives",
        "U.S. Attorneys - Prosecute federal crimes in districts nationwide",
        "Civil Rights Division - Enforces civil rights laws"
      ],
      proposedImpact: "Ensures equal justice under law, enforces federal statutes, and protects civil rights while maintaining national security and public safety.",
      inPracticeByStates: [
        "U.S. Attorneys offices in each federal district coordinate with state law enforcement",
        "Civil rights enforcement varies by regional priorities",
        "Federal crime prosecution complements state criminal justice systems"
      ]
    },
    "tariff": {
      term: "tariff",
      briefRundown: "A tariff is a tax imposed on imported goods to protect domestic industries or raise government revenue. Tariffs increase the cost of foreign products, making domestic alternatives more competitive.",
      proposedImpact: "Protects domestic jobs and industries from foreign competition while potentially raising consumer prices and triggering trade disputes.",
      inPracticeByStates: [
        "Federal policy affects all states but impacts vary by industry concentration",
        "Manufacturing states may benefit while consumer-focused states see higher prices",
        "Port states handle administrative and economic effects of tariff collection"
      ]
    },
    "NAFTA": {
      term: "NAFTA",
      briefRundown: "The North American Free Trade Agreement was a trade deal between the United States, Canada, and Mexico that eliminated most tariffs and trade barriers from 1994 to 2020. It was replaced by the USMCA in 2020.",
      proposedImpact: "Increased trade between the three countries, created jobs in some sectors while displacing workers in others, particularly manufacturing.",
      compareContrast: {
        historicalUS: [
          "Previous bilateral trade agreements with individual countries",
          "General Agreement on Tariffs and Trade (GATT) - global trade framework"
        ],
        otherCountries: [
          "European Union - comprehensive economic integration",
          "ASEAN Free Trade Area - Southeast Asian trade bloc"
        ]
      }
    },
    "EPA": {
      term: "EPA",
      briefRundown: "The Environmental Protection Agency is a federal agency responsible for protecting human health and the environment by enforcing environmental laws and regulations.",
      components: [
        "Air Quality Standards - Sets and enforces clean air regulations",
        "Water Protection - Ensures safe drinking water and clean waterways",
        "Chemical Safety - Regulates toxic substances and pesticides",
        "Waste Management - Oversees hazardous waste cleanup and disposal"
      ],
      proposedImpact: "Reduces pollution, protects public health from environmental hazards, and preserves natural resources for future generations."
    },
    "Federal Reserve": {
      term: "Federal Reserve",
      briefRundown: "The Federal Reserve is the central banking system of the United States, responsible for conducting monetary policy, supervising banks, and maintaining financial stability. It was established in 1913 to provide the country with a safe, flexible, and stable monetary and financial system.",
      components: [
        "Board of Governors - Seven-member board appointed by the President",
        "Federal Open Market Committee (FOMC) - Sets monetary policy and interest rates",
        "12 Regional Federal Reserve Banks - Serve different geographic regions",
        "Member Banks - Private banks that are part of the Federal Reserve System"
      ],
      proposedImpact: "Maintains price stability, full employment, and moderate long-term interest rates while supervising the banking system to ensure financial stability and consumer protection.",
      inPracticeByStates: [
        "Each of the 12 Federal Reserve districts serves multiple states",
        "Regional Fed banks provide banking services to local financial institutions",
        "Economic data and research varies by region to reflect local conditions"
      ]
    },
    "filibuster": {
      term: "filibuster",
      briefRundown: "A filibuster is a legislative tactic used in the U.S. Senate to delay or prevent a vote on legislation by extending debate indefinitely. It requires 60 votes to end debate and proceed to a vote.",
      proposedImpact: "Protects minority party rights and encourages bipartisan compromise, but can also obstruct popular legislation and slow government action.",
      inPracticeByStates: [
        "Affects all federal legislation that impacts states",
        "Some state legislatures have similar rules while others have eliminated them",
        "Creates different legislative dynamics in state vs federal government"
      ]
    },
    "gerrymandering": {
      term: "gerrymandering",
      briefRundown: "Gerrymandering is the practice of redrawing electoral district boundaries to favor one political party or group. It can dilute the voting power of certain communities and create uncompetitive elections.",
      proposedImpact: "Can ensure party dominance in elections but undermines fair representation and democratic accountability by creating safe seats.",
      inPracticeByStates: [
        "Each state controls its own redistricting process",
        "Some states use independent commissions while others rely on state legislatures",
        "Federal courts can intervene in cases of racial gerrymandering"
      ]
    },
    "Senate": {
      term: "Senate",
      briefRundown: "The U.S. Senate is the upper chamber of Congress, with 100 members (two from each state) serving six-year terms. It has equal representation regardless of state population and unique powers like confirming presidential nominees and trying impeachments.",
      components: [
        "100 Senators - Two from each state regardless of population",
        "Six-year terms - Staggered so about 1/3 are up for election every two years",
        "Majority Leader - Leads the majority party and sets the legislative agenda",
        "Committee System - Specialized committees handle different policy areas"
      ],
      proposedImpact: "Provides equal state representation in federal government, ensures smaller states have significant influence, and serves as a deliberative body for major legislation.",
      inPracticeByStates: [
        "Each state elects two senators regardless of population size",
        "Senators represent entire state rather than specific districts",
        "Small states like Wyoming have same Senate power as large states like California"
      ]
    },
    "Congress": {
      term: "Congress",
      briefRundown: "The U.S. Congress is the federal legislative branch consisting of the House of Representatives and Senate. It has the power to make laws, control government spending, regulate interstate commerce, and oversee the executive branch.",
      components: [
        "House of Representatives - 435 members serving two-year terms, representation based on population",
        "Senate - 100 members serving six-year terms, equal representation per state",
        "Committee System - Specialized committees in both chambers handle different policy areas",
        "Leadership - Speaker of the House, Majority/Minority Leaders, and committee chairs"
      ],
      proposedImpact: "Creates and passes federal laws, controls government budget and spending, provides oversight of executive agencies, and represents diverse constituencies.",
      inPracticeByStates: [
        "House districts redrawn every 10 years based on census data",
        "Each state guaranteed at least one House representative",
        "States with larger populations have more House seats but equal Senate representation"
      ]
    },
    "Secret Service": {
      term: "Secret Service",
      briefRundown: "The U.S. Secret Service is a federal law enforcement agency that protects current and former presidents, vice presidents, and other high-ranking officials, while also investigating financial crimes and cybercrime.",
      components: [
        "Protective Division - Provides security for presidents, vice presidents, and their families",
        "Investigative Division - Handles financial crimes, counterfeiting, and cybercrime",
        "Uniformed Division - Provides security at White House and other federal buildings",
        "Technical Security Division - Handles electronic security and surveillance"
      ],
      proposedImpact: "Ensures continuity of government by protecting key officials and maintains financial system integrity by investigating monetary crimes.",
      inPracticeByStates: [
        "Field offices in major cities coordinate with local law enforcement",
        "Protection extends to former presidents and their spouses for life",
        "Investigates crimes that cross state lines or involve federal jurisdiction"
      ]
    },
    "Committee on Homeland Security": {
      term: "Committee on Homeland Security",
      briefRundown: "The House Committee on Homeland Security oversees the Department of Homeland Security and addresses issues related to national security, border security, cybersecurity, and emergency preparedness.",
      components: [
        "Border Security Subcommittee - Handles immigration and border control issues",
        "Cybersecurity Subcommittee - Addresses digital threats and infrastructure protection",
        "Emergency Preparedness Subcommittee - Focuses on disaster response and resilience",
        "Intelligence and Counterterrorism Subcommittee - Handles terrorism prevention"
      ],
      proposedImpact: "Ensures effective homeland security policies, oversees DHS operations, and addresses emerging security threats to protect American communities.",
      inPracticeByStates: [
        "Committee policies affect federal security operations in all states",
        "Border states particularly impacted by immigration and border security decisions",
        "Cybersecurity initiatives protect critical infrastructure nationwide"
      ]
    },
    "Senate Committee on Foreign Relations": {
      term: "Senate Committee on Foreign Relations",
      briefRundown: "The Senate Committee on Foreign Relations has jurisdiction over foreign policy, international treaties, diplomatic nominations, and foreign aid. It plays a crucial role in confirming ambassadors and approving international agreements.",
      components: [
        "Treaty Review - Examines and votes on international treaties",
        "Ambassador Confirmations - Reviews and confirms diplomatic appointments",
        "Foreign Aid Oversight - Monitors international assistance programs",
        "Regional Subcommittees - Focus on specific geographic areas"
      ],
      proposedImpact: "Shapes U.S. foreign policy, ensures diplomatic accountability, and maintains congressional oversight of international relations.",
      inPracticeByStates: [
        "Foreign policy decisions affect trade relationships important to all states",
        "Military installations in various states influenced by international agreements",
        "Immigration and refugee policies impact communities nationwide"
      ]
    },
    "MAGA": {
      term: "MAGA",
      briefRundown: "MAGA (Make America Great Again) is a political slogan and movement associated with Donald Trump's presidential campaigns and political agenda. It represents a populist, nationalist approach to American politics.",
      proposedImpact: "Aims to restore what supporters see as America's former prominence through policies like trade protectionism, immigration restrictions, and America First foreign policy.",
      inPracticeByStates: [
        "Movement has varying support levels across different states and regions",
        "Rural and industrial areas often show stronger support",
        "Urban areas typically show less support for MAGA policies"
      ]
    },
    "Make America Great Again": {
      term: "Make America Great Again",
      briefRundown: "Make America Great Again is a political slogan that became the rallying cry for Donald Trump's political movement. It emphasizes returning to perceived better times in American history.",
      proposedImpact: "Seeks to restore American manufacturing, strengthen border security, reduce foreign intervention, and prioritize American workers and interests.",
      inPracticeByStates: [
        "Policies vary in implementation across different states",
        "Manufacturing states often embrace trade protection policies",
        "Border states affected by immigration enforcement priorities"
      ]
    },
    "Tea Party": {
      term: "Tea Party",
      briefRundown: "The Tea Party movement was a conservative political movement that emerged in 2009, emphasizing fiscal responsibility, limited government, and constitutional principles. Named after the Boston Tea Party.",
      proposedImpact: "Advocated for reduced government spending, lower taxes, reduced national debt, and adherence to an originalist interpretation of the Constitution.",
      inPracticeByStates: [
        "Influenced Republican primaries and elections in many states",
        "Some states adopted Tea Party-backed fiscal policies",
        "Movement's influence varied significantly by state and region"
      ]
    },
    "Black Lives Matter": {
      term: "Black Lives Matter",
      briefRundown: "Black Lives Matter (BLM) is a social movement advocating against violence and systemic racism towards black people, particularly regarding police brutality and criminal justice reform.",
      proposedImpact: "Seeks to address racial inequality, reform police practices, and promote social justice through policy changes and community activism.",
      inPracticeByStates: [
        "Different states have implemented varying police reform measures",
        "Some cities and states have changed policing policies in response",
        "Movement's impact varies significantly across different communities"
      ]
    }
  };
  
  
  // Check if we have detailed static data for this term
  if (contextDatabase[canonicalTerm]) {
    return contextDatabase[canonicalTerm];
  }
  // If not in static database, try AI. If AI fails, return null (no generic fallback)
  const aiResult = await generateContextWithAI(canonicalTerm);
  if (aiResult && aiResult.briefRundown && !aiResult.briefRundown.toLowerCase().includes('is a political term or entity')) {
    return aiResult;
  }
  return null;
}