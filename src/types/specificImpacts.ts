// Specific, measurable impact analysis types

export interface SpecificImpactMetric {
  id: string;
  name: string;
  unit: string;
  description: string;
  currentBaseline?: number;
  projectedChange: number | null; // null if insufficient data
  changeRange: {
    min: number;
    max: number;
  } | null;
  confidence: 'high' | 'medium' | 'low' | 'insufficient_data';
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  reasoning: string;
  dataQuality: {
    historicalPrecedents: number;
    relevantStudies: number;
    expertConsensus: 'strong' | 'moderate' | 'weak' | 'none';
  };
  billSections: string[]; // Which parts of the bill affect this metric
  keyAssumptions: string[];
  uncertaintyFactors: string[];
}

export interface EconomicImpacts {
  gdp: SpecificImpactMetric;
  inflation: SpecificImpactMetric;
  unemployment: SpecificImpactMetric;
  federalDebt: SpecificImpactMetric;
  consumerSpending: SpecificImpactMetric;
  businessInvestment: SpecificImpactMetric;
  tradeBalance: SpecificImpactMetric;
  productivity: SpecificImpactMetric;
}

export interface HealthcareImpacts {
  uninsuredRate: SpecificImpactMetric;
  premiumCosts: SpecificImpactMetric;
  outOfPocketCosts: SpecificImpactMetric;
  medicareSpending: SpecificImpactMetric;
  medicaidEnrollment: SpecificImpactMetric;
  lifeExpectancy: SpecificImpactMetric;
  infantMortality: SpecificImpactMetric;
  preventiveCareUtilization: SpecificImpactMetric;
}

export interface EnvironmentalImpacts {
  carbonEmissions: SpecificImpactMetric;
  airQualityIndex: SpecificImpactMetric;
  renewableEnergyPercent: SpecificImpactMetric;
  waterQualityScore: SpecificImpactMetric;
  wildlifePopulations: SpecificImpactMetric;
  forestCover: SpecificImpactMetric;
  recyclingRate: SpecificImpactMetric;
  energyEfficiency: SpecificImpactMetric;
}

export interface EducationImpacts {
  graduationRate: SpecificImpactMetric;
  testScores: SpecificImpactMetric;
  collegeEnrollment: SpecificImpactMetric;
  studentLoanDebt: SpecificImpactMetric;
  teacherSalaries: SpecificImpactMetric;
  classSize: SpecificImpactMetric;
  schoolFunding: SpecificImpactMetric;
  digitalAccess: SpecificImpactMetric;
}

export interface SocialImpacts {
  povertyRate: SpecificImpactMetric;
  incomeInequality: SpecificImpactMetric;
  socialMobility: SpecificImpactMetric;
  crimeRate: SpecificImpactMetric;
  housingAffordability: SpecificImpactMetric;
  foodSecurity: SpecificImpactMetric;
  mentalhealthSupport: SpecificImpactMetric;
  civilRightsProtections: SpecificImpactMetric;
}

export interface InfrastructureImpacts {
  roadConditionIndex: SpecificImpactMetric;
  bridgeSafetyScore: SpecificImpactMetric;
  broadbandAccess: SpecificImpactMetric;
  publicTransitRidership: SpecificImpactMetric;
  powerGridReliability: SpecificImpactMetric;
  waterSystemQuality: SpecificImpactMetric;
  constructionJobs: SpecificImpactMetric;
  commuteTimes: SpecificImpactMetric;
}

export interface SpecificImpactAnalysis {
  billName: string;
  billSummary: string;
  analysisTimestamp: string;
  deterministic: boolean; // true if results should be stable
  overallAssessment: {
    feasibilityScore: number; // 0-100
    implementationComplexity: 'low' | 'medium' | 'high' | 'very_high';
    budgetRequirement: number | null; // in billions
    timeToImplementation: string;
    politicalViability: number; // 0-100
  };
  economicImpacts: EconomicImpacts;
  healthcareImpacts: HealthcareImpacts;
  environmentalImpacts: EnvironmentalImpacts;
  educationImpacts: EducationImpacts;
  socialImpacts: SocialImpacts;
  infrastructureImpacts: InfrastructureImpacts;
  keyFindings: string[];
  majorUncertainties: string[];
  evidenceGaps: string[];
  recommendedMonitoring: string[];
}

export interface BillSection {
  sectionNumber: string;
  title: string;
  summary: string;
  budgetImpact: number | null;
  affectedMetrics: string[]; // IDs of metrics this section impacts
  implementationTimeline: string;
  dependencies: string[]; // What this section depends on
}

export interface HistoricalPolicyData {
  policyName: string;
  year: number;
  description: string;
  actualOutcomes: {
    [metricId: string]: {
      measuredValue: number;
      measurementYear: number;
      source: string;
      methodology: string;
    };
  };
  budgetActual: number | null;
  implementationChallenges: string[];
  unexpectedConsequences: string[];
  successFactors: string[];
}

// Deterministic hash function for stable analysis
export function generateAnalysisHash(billName: string): string {
  let hash = 0;
  const str = billName.toLowerCase().replace(/\s+/g, '');
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

// Confidence level determination
export function determineConfidence(
  historicalPrecedents: number,
  relevantStudies: number,
  expertConsensus: string
): 'high' | 'medium' | 'low' | 'insufficient_data' {
  if (historicalPrecedents === 0 && relevantStudies === 0) {
    return 'insufficient_data';
  }
  
  if (historicalPrecedents >= 3 && relevantStudies >= 5 && expertConsensus === 'strong') {
    return 'high';
  }
  
  if (historicalPrecedents >= 2 && relevantStudies >= 3) {
    return 'medium';
  }
  
  return 'low';
}