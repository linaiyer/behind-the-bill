// Legislative Impact Simulator Types

export interface ImpactCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface ImpactScore {
  category: string;
  impact: number; // -100 to +100 scale
  confidence: number; // 0 to 100 confidence level
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  reasoning: string;
  historicalPrecedents: string[];
}

export interface ImpactPrediction {
  billName: string;
  billSummary: string;
  overallImpact: number; // -100 to +100
  politicalFeasibility: number; // 0 to 100
  implementationComplexity: number; // 0 to 100
  categoryScores: ImpactScore[];
  keyInsights: string[];
  riskFactors: string[];
  similarPolicies: HistoricalPolicy[];
  lastUpdated: string;
}

export interface HistoricalPolicy {
  name: string;
  year: number;
  description: string;
  actualOutcomes: {
    category: string;
    impact: number;
    measuredAfterYears: number;
    source: string;
  }[];
  similarities: string[];
}

export interface SimulationInput {
  billName: string;
  billType: 'healthcare' | 'economic' | 'environmental' | 'education' | 'defense' | 'immigration' | 'infrastructure' | 'other';
  billText?: string;
  proposedBudget?: number;
  implementationTimeline?: string;
  targetPopulation?: string;
  geographicScope: 'federal' | 'state' | 'local';
}

export interface EconomicIndicators {
  gdpImpact: number;
  jobsCreated: number;
  jobsLost: number;
  budgetCost: number;
  taxRevenue: number;
  inflationEffect: number;
  marketSectorImpacts: {
    sector: string;
    impact: number;
  }[];
}

export interface HealthcareIndicators {
  coverageChange: number; // people affected
  costPerPerson: number;
  qualityImpact: number;
  accessibilityImprovement: number;
  preventiveCareImpact: number;
  chronicDiseaseImpact: number;
}

export interface EnvironmentalIndicators {
  carbonEmissionsChange: number;
  airQualityImpact: number;
  waterQualityImpact: number;
  renewableEnergyImpact: number;
  biodiversityImpact: number;
  wasteReductionImpact: number;
}

export interface SocialIndicators {
  educationImpact: number;
  povertyReduction: number;
  incomeInequality: number;
  publicSafetyImpact: number;
  civilRightsImpact: number;
  communityDevelopment: number;
}

// Default impact categories
export const IMPACT_CATEGORIES: ImpactCategory[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'GDP, jobs, business impact, market effects',
    icon: '💰',
    color: '#4CAF50'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Coverage, costs, quality, accessibility',
    icon: '🏥',
    color: '#2196F3'
  },
  {
    id: 'education',
    name: 'Education',
    description: 'School funding, student outcomes, accessibility',
    icon: '📚',
    color: '#FF9800'
  },
  {
    id: 'environment',
    name: 'Environment',
    description: 'Climate, pollution, conservation, energy',
    icon: '🌱',
    color: '#8BC34A'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Transportation, utilities, broadband, housing',
    icon: '🏗️',
    color: '#607D8B'
  },
  {
    id: 'social_equity',
    name: 'Social Equity',
    description: 'Civil rights, income inequality, opportunity',
    icon: '⚖️',
    color: '#9C27B0'
  },
  {
    id: 'public_safety',
    name: 'Public Safety',
    description: 'Crime, emergency response, national security',
    icon: '🛡️',
    color: '#F44336'
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Innovation, digital divide, cybersecurity',
    icon: '💻',
    color: '#3F51B5'
  }
];

export interface SimulatorState {
  currentBill: string | null;
  prediction: ImpactPrediction | null;
  isLoading: boolean;
  selectedTimeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  selectedCategories: string[];
  comparisonMode: boolean;
  comparisonBills: string[];
}