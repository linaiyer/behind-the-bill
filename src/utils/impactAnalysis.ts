// AI-Powered Legislative Impact Analysis Engine

import { 
  ImpactPrediction, 
  ImpactScore, 
  HistoricalPolicy, 
  SimulationInput, 
  IMPACT_CATEGORIES,
  EconomicIndicators,
  HealthcareIndicators,
  EnvironmentalIndicators,
  SocialIndicators
} from '../types/simulator';

interface HistoricalPolicyDatabase {
  [key: string]: HistoricalPolicy[];
}

// Historical policy database for training the AI predictions
const HISTORICAL_POLICIES: HistoricalPolicyDatabase = {
  healthcare: [
    {
      name: "Affordable Care Act (ACA)",
      year: 2010,
      description: "Comprehensive healthcare reform expanding coverage and regulating insurance markets",
      actualOutcomes: [
        { category: 'healthcare', impact: 75, measuredAfterYears: 5, source: 'CBO Analysis 2015' },
        { category: 'economy', impact: -15, measuredAfterYears: 3, source: 'Economic Policy Institute' },
        { category: 'social_equity', impact: 60, measuredAfterYears: 5, source: 'Kaiser Family Foundation' }
      ],
      similarities: ["individual mandate", "insurance marketplaces", "medicaid expansion", "employer mandate"]
    },
    {
      name: "Medicare Part D",
      year: 2003,
      description: "Prescription drug benefit program for Medicare beneficiaries",
      actualOutcomes: [
        { category: 'healthcare', impact: 45, measuredAfterYears: 3, source: 'Medicare.gov Reports' },
        { category: 'economy', impact: -25, measuredAfterYears: 2, source: 'CMS Financial Reports' }
      ],
      similarities: ["prescription drug coverage", "senior benefits", "private insurance"]
    }
  ],
  economic: [
    {
      name: "American Recovery and Reinvestment Act (ARRA)",
      year: 2009,
      description: "Economic stimulus package during the Great Recession",
      actualOutcomes: [
        { category: 'economy', impact: 65, measuredAfterYears: 2, source: 'CBO Economic Analysis' },
        { category: 'infrastructure', impact: 55, measuredAfterYears: 3, source: 'DOT Infrastructure Reports' },
        { category: 'education', impact: 40, measuredAfterYears: 2, source: 'Department of Education' }
      ],
      similarities: ["economic stimulus", "infrastructure spending", "job creation", "recession response"]
    },
    {
      name: "Tax Cuts and Jobs Act",
      year: 2017,
      description: "Comprehensive tax reform reducing corporate and individual tax rates",
      actualOutcomes: [
        { category: 'economy', impact: 30, measuredAfterYears: 2, source: 'Treasury Department' },
        { category: 'social_equity', impact: -20, measuredAfterYears: 3, source: 'Tax Policy Center' }
      ],
      similarities: ["tax reduction", "corporate tax reform", "individual tax changes"]
    }
  ],
  environmental: [
    {
      name: "Clean Air Act Amendments",
      year: 1990,
      description: "Comprehensive air pollution control legislation",
      actualOutcomes: [
        { category: 'environment', impact: 70, measuredAfterYears: 10, source: 'EPA Environmental Reports' },
        { category: 'healthcare', impact: 35, measuredAfterYears: 5, source: 'CDC Health Studies' },
        { category: 'economy', impact: -10, measuredAfterYears: 5, source: 'Industry Impact Studies' }
      ],
      similarities: ["emissions reduction", "environmental regulation", "cap and trade"]
    }
  ],
  infrastructure: [
    {
      name: "Infrastructure Investment and Jobs Act",
      year: 2021,
      description: "Massive infrastructure investment in roads, bridges, broadband, and utilities",
      actualOutcomes: [
        { category: 'infrastructure', impact: 80, measuredAfterYears: 1, source: 'DOT Progress Reports' },
        { category: 'economy', impact: 45, measuredAfterYears: 1, source: 'Economic Analysis Bureau' },
        { category: 'technology', impact: 50, measuredAfterYears: 1, source: 'FCC Broadband Reports' }
      ],
      similarities: ["infrastructure investment", "job creation", "broadband expansion", "transportation"]
    }
  ]
};

class LegislativeImpactAnalyzer {
  private historicalData: HistoricalPolicyDatabase;

  constructor() {
    this.historicalData = HISTORICAL_POLICIES;
  }

  async analyzeBillImpact(billName: string, billDescription?: string): Promise<ImpactPrediction> {
    // Simulate AI analysis with sophisticated logic based on historical data
    const billType = this.classifyBill(billName, billDescription);
    const similarPolicies = this.findSimilarPolicies(billName, billDescription, billType);
    const categoryScores = await this.calculateCategoryScores(billName, billDescription, billType, similarPolicies);
    
    const overallImpact = this.calculateOverallImpact(categoryScores);
    const politicalFeasibility = this.assessPoliticalFeasibility(billName, billType);
    const implementationComplexity = this.assessImplementationComplexity(billName, billType);
    
    return {
      billName,
      billSummary: billDescription || this.generateBillSummary(billName),
      overallImpact,
      politicalFeasibility,
      implementationComplexity,
      categoryScores,
      keyInsights: this.generateKeyInsights(categoryScores, similarPolicies),
      riskFactors: this.identifyRiskFactors(billName, billType, categoryScores),
      similarPolicies: similarPolicies.slice(0, 3), // Top 3 similar policies
      lastUpdated: new Date().toISOString()
    };
  }

  private classifyBill(billName: string, description?: string): string {
    const text = `${billName} ${description || ''}`.toLowerCase();
    
    if (text.includes('healthcare') || text.includes('health') || text.includes('medicare') || text.includes('medicaid')) {
      return 'healthcare';
    }
    if (text.includes('infrastructure') || text.includes('transportation') || text.includes('broadband')) {
      return 'infrastructure';
    }
    if (text.includes('tax') || text.includes('economic') || text.includes('stimulus') || text.includes('jobs')) {
      return 'economic';
    }
    if (text.includes('environment') || text.includes('climate') || text.includes('clean') || text.includes('green')) {
      return 'environmental';
    }
    if (text.includes('education') || text.includes('school') || text.includes('student')) {
      return 'education';
    }
    
    return 'other';
  }

  private findSimilarPolicies(billName: string, description: string = '', billType: string): HistoricalPolicy[] {
    const relevantPolicies = this.historicalData[billType] || [];
    const allPolicies = Object.values(this.historicalData).flat();
    
    // Score policies based on similarity
    const scoredPolicies = allPolicies.map(policy => {
      let similarity = 0;
      const billText = `${billName} ${description}`.toLowerCase();
      
      // Check for keyword matches
      policy.similarities.forEach(keyword => {
        if (billText.includes(keyword.toLowerCase())) {
          similarity += 1;
        }
      });
      
      // Boost policies of the same type
      if (relevantPolicies.includes(policy)) {
        similarity += 2;
      }
      
      return { policy, similarity };
    });
    
    return scoredPolicies
      .filter(item => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.policy);
  }

  private async calculateCategoryScores(
    billName: string, 
    description: string = '', 
    billType: string, 
    similarPolicies: HistoricalPolicy[]
  ): Promise<ImpactScore[]> {
    
    const scores: ImpactScore[] = [];
    
    for (const category of IMPACT_CATEGORIES) {
      const historicalData = this.getHistoricalImpactForCategory(category.id, similarPolicies);
      const baseImpact = this.calculateBaseImpact(billName, description, category.id, billType);
      const adjustedImpact = this.adjustImpactBasedOnHistory(baseImpact, historicalData);
      
      scores.push({
        category: category.id,
        impact: Math.round(adjustedImpact),
        confidence: this.calculateConfidence(historicalData.length, category.id, billType),
        timeframe: this.determineTimeframe(category.id, billType),
        reasoning: this.generateReasoning(billName, category.id, adjustedImpact, historicalData),
        historicalPrecedents: historicalData.map(data => 
          `${data.policyName} (${data.year}): ${data.impact > 0 ? '+' : ''}${data.impact}% impact`
        )
      });
    }
    
    return scores;
  }

  private getHistoricalImpactForCategory(categoryId: string, similarPolicies: HistoricalPolicy[]) {
    const impacts: Array<{policyName: string, year: number, impact: number}> = [];
    
    similarPolicies.forEach(policy => {
      policy.actualOutcomes.forEach(outcome => {
        if (outcome.category === categoryId) {
          impacts.push({
            policyName: policy.name,
            year: policy.year,
            impact: outcome.impact
          });
        }
      });
    });
    
    return impacts;
  }

  private calculateBaseImpact(billName: string, description: string, categoryId: string, billType: string): number {
    const text = `${billName} ${description}`.toLowerCase();
    let impact = 0;
    
    // Category-specific impact calculation logic
    switch (categoryId) {
      case 'healthcare':
        if (text.includes('universal') || text.includes('medicare for all')) impact = 80;
        else if (text.includes('expand') || text.includes('coverage')) impact = 60;
        else if (text.includes('reform')) impact = 40;
        else if (billType === 'healthcare') impact = 30;
        break;
        
      case 'economy':
        if (text.includes('stimulus') || text.includes('relief')) impact = 50;
        else if (text.includes('tax cut') || text.includes('tax reduction')) impact = 30;
        else if (text.includes('spending') || text.includes('investment')) impact = 40;
        else if (text.includes('regulation')) impact = -20;
        break;
        
      case 'environment':
        if (text.includes('green new deal') || text.includes('climate action')) impact = 70;
        else if (text.includes('clean energy') || text.includes('renewable')) impact = 60;
        else if (text.includes('pollution') || text.includes('emissions')) impact = 50;
        else if (billType === 'environmental') impact = 40;
        break;
        
      case 'infrastructure':
        if (text.includes('infrastructure') && text.includes('investment')) impact = 70;
        else if (text.includes('broadband') || text.includes('roads')) impact = 50;
        else if (text.includes('transportation')) impact = 40;
        break;
        
      default:
        if (billType === categoryId) impact = 30;
    }
    
    // Add some randomness to simulate AI uncertainty
    return impact + (Math.random() - 0.5) * 20;
  }

  private adjustImpactBasedOnHistory(baseImpact: number, historicalData: Array<{impact: number}>): number {
    if (historicalData.length === 0) return baseImpact;
    
    const avgHistoricalImpact = historicalData.reduce((sum, data) => sum + data.impact, 0) / historicalData.length;
    
    // Weight: 70% base calculation, 30% historical average
    return (baseImpact * 0.7) + (avgHistoricalImpact * 0.3);
  }

  private calculateConfidence(historicalDataPoints: number, categoryId: string, billType: string): number {
    let confidence = 50; // Base confidence
    
    // More historical data = higher confidence
    confidence += Math.min(historicalDataPoints * 10, 30);
    
    // Category alignment with bill type increases confidence
    if (categoryId === billType) confidence += 20;
    
    // Certain categories are easier to predict
    if (['economy', 'healthcare'].includes(categoryId)) confidence += 10;
    
    return Math.min(Math.round(confidence), 95);
  }

  private determineTimeframe(categoryId: string, billType: string): 'immediate' | 'short_term' | 'medium_term' | 'long_term' {
    if (['economy', 'public_safety'].includes(categoryId)) return 'short_term';
    if (['healthcare', 'education'].includes(categoryId)) return 'medium_term';
    if (['environment', 'social_equity'].includes(categoryId)) return 'long_term';
    return 'medium_term';
  }

  private generateReasoning(billName: string, categoryId: string, impact: number, historicalData: any[]): string {
    const direction = impact > 0 ? 'positive' : impact < 0 ? 'negative' : 'neutral';
    const magnitude = Math.abs(impact) > 50 ? 'significant' : Math.abs(impact) > 25 ? 'moderate' : 'minor';
    
    let reasoning = `Based on analysis, ${billName} is predicted to have a ${magnitude} ${direction} impact on ${categoryId}.`;
    
    if (historicalData.length > 0) {
      reasoning += ` This assessment is informed by ${historicalData.length} similar historical policies.`;
    }
    
    // Add category-specific reasoning
    switch (categoryId) {
      case 'economy':
        reasoning += impact > 0 ? ' Expected job creation and GDP growth.' : ' Potential regulatory burden on businesses.';
        break;
      case 'healthcare':
        reasoning += impact > 0 ? ' Improved access and coverage anticipated.' : ' Possible disruption to existing systems.';
        break;
      case 'environment':
        reasoning += impact > 0 ? ' Environmental benefits through reduced emissions.' : ' Potential environmental trade-offs.';
        break;
    }
    
    return reasoning;
  }

  private calculateOverallImpact(categoryScores: ImpactScore[]): number {
    const weightedScores = categoryScores.map(score => score.impact * (score.confidence / 100));
    return Math.round(weightedScores.reduce((sum, score) => sum + score, 0) / categoryScores.length);
  }

  private assessPoliticalFeasibility(billName: string, billType: string): number {
    let feasibility = 50; // Base feasibility
    
    const text = billName.toLowerCase();
    
    // Bipartisan issues tend to be more feasible
    if (text.includes('infrastructure') || text.includes('veterans')) feasibility += 30;
    
    // Controversial topics are less feasible
    if (text.includes('medicare for all') || text.includes('green new deal')) feasibility -= 20;
    
    // Current political climate adjustments
    if (billType === 'healthcare') feasibility -= 10;
    if (billType === 'infrastructure') feasibility += 20;
    
    return Math.max(10, Math.min(90, Math.round(feasibility)));
  }

  private assessImplementationComplexity(billName: string, billType: string): number {
    let complexity = 50; // Base complexity
    
    const text = billName.toLowerCase();
    
    // Large-scale programs are more complex
    if (text.includes('universal') || text.includes('comprehensive')) complexity += 30;
    
    // Simple bills are less complex
    if (text.includes('extend') || text.includes('continue')) complexity -= 20;
    
    // Type-based complexity
    switch (billType) {
      case 'healthcare': complexity += 20; break;
      case 'infrastructure': complexity += 10; break;
      case 'economic': complexity -= 10; break;
    }
    
    return Math.max(10, Math.min(90, Math.round(complexity)));
  }

  private generateKeyInsights(categoryScores: ImpactScore[], similarPolicies: HistoricalPolicy[]): string[] {
    const insights: string[] = [];
    
    // Top impact categories
    const topImpacts = categoryScores
      .filter(score => Math.abs(score.impact) > 40)
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
    
    if (topImpacts.length > 0) {
      const category = IMPACT_CATEGORIES.find(cat => cat.id === topImpacts[0].category);
      insights.push(`Strongest impact expected in ${category?.name} with ${topImpacts[0].impact > 0 ? 'positive' : 'negative'} effects`);
    }
    
    // Historical precedent insight
    if (similarPolicies.length > 0) {
      insights.push(`Analysis based on ${similarPolicies.length} similar historical policies including ${similarPolicies[0].name}`);
    }
    
    // Confidence insight
    const avgConfidence = categoryScores.reduce((sum, score) => sum + score.confidence, 0) / categoryScores.length;
    if (avgConfidence > 70) {
      insights.push('High confidence prediction based on substantial historical data');
    } else if (avgConfidence < 50) {
      insights.push('Moderate confidence - limited historical precedents available');
    }
    
    return insights;
  }

  private identifyRiskFactors(billName: string, billType: string, categoryScores: ImpactScore[]): string[] {
    const risks: string[] = [];
    
    // High negative impacts
    const negativeImpacts = categoryScores.filter(score => score.impact < -30);
    negativeImpacts.forEach(impact => {
      const category = IMPACT_CATEGORIES.find(cat => cat.id === impact.category);
      risks.push(`Potential negative impact on ${category?.name}`);
    });
    
    // Low confidence scores
    const lowConfidenceScores = categoryScores.filter(score => score.confidence < 50);
    if (lowConfidenceScores.length > 2) {
      risks.push('High uncertainty due to limited historical precedents');
    }
    
    // Bill-specific risks
    if (billName.toLowerCase().includes('tax')) {
      risks.push('Revenue impact depends on economic conditions');
    }
    
    if (billType === 'healthcare') {
      risks.push('Implementation challenges in healthcare systems');
    }
    
    return risks;
  }

  private generateBillSummary(billName: string): string {
    // Generate a basic summary if none provided
    return `${billName} represents proposed federal legislation aimed at addressing key policy priorities through targeted interventions and resource allocation.`;
  }
}

// Export singleton instance
export const impactAnalyzer = new LegislativeImpactAnalyzer();

// Helper functions for external use
export async function analyzeLegislativeImpact(billName: string, description?: string): Promise<ImpactPrediction> {
  return await impactAnalyzer.analyzeBillImpact(billName, description);
}

export function getImpactCategories() {
  return IMPACT_CATEGORIES;
}