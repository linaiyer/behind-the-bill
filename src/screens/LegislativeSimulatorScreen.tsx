import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SpecificImpactAnalysis, SpecificImpactMetric } from '../types/specificImpacts';
import { analyzeSpecificLegislativeImpacts } from '../utils/specificImpactAnalysis';

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleReader: { article: any };
  Context: { term: string };
  LegislativeSimulator: { billName: string; billDescription?: string };
};

type LegislativeSimulatorScreenRouteProp = RouteProp<RootStackParamList, 'LegislativeSimulator'>;
type LegislativeSimulatorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LegislativeSimulator'>;

interface LegislativeSimulatorScreenProps {
  route: LegislativeSimulatorScreenRouteProp;
  navigation: LegislativeSimulatorScreenNavigationProp;
}

const THEME_COLOR = '#008080';
const BLACK = '#111111';
const GRAY = '#6B6B6B';
const LIGHT_GRAY = '#f8f9fa';

export default function LegislativeSimulatorScreen({ route, navigation }: LegislativeSimulatorScreenProps) {
  const { billName, billDescription } = route.params;
  const [analysis, setAnalysis] = useState<SpecificImpactAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'economic' | 'healthcare' | 'environmental' | 'education' | 'social' | 'infrastructure'>('economic');

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      const impactAnalysis = await analyzeSpecificLegislativeImpacts(billName, billDescription);
      setAnalysis(impactAnalysis);
    } catch (error) {
      console.error('Failed to analyze legislation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalysis();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAnalysis();
  }, [billName, billDescription]);

  const MetricCard = ({ metric }: { metric: SpecificImpactMetric }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricName}>{metric.name}</Text>
        <View style={styles.confidenceBadge}>
          <Text style={[styles.confidenceText, { color: getConfidenceColor(metric.confidence) }]}>
            {metric.confidence.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.metricValue}>
        {metric.projectedChange !== null ? (
          <>
            <Text style={styles.projectedChange}>
              {metric.projectedChange > 0 ? '+' : ''}{metric.projectedChange} {metric.unit}
            </Text>
            {metric.changeRange && (
              <Text style={styles.changeRange}>
                Range: {metric.changeRange.min} to {metric.changeRange.max}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.insufficientData}>Insufficient Data</Text>
        )}
      </View>
      
      <Text style={styles.metricReasoning}>{metric.reasoning}</Text>
      
      {metric.billSections.length > 0 && (
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionsTitle}>Relevant Bill Sections:</Text>
          {metric.billSections.map((section, index) => (
            <Text key={index} style={styles.sectionText}>• {section}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      case 'insufficient_data': return '#6b7280';
      default: return GRAY;
    }
  };

  const CategorySelector = () => {
    const categories = [
      { key: 'economic', label: 'Economic', icon: 'trending-up' },
      { key: 'healthcare', label: 'Healthcare', icon: 'medical' },
      { key: 'environmental', label: 'Environmental', icon: 'leaf' },
      { key: 'education', label: 'Education', icon: 'school' },
      { key: 'social', label: 'Social', icon: 'people' },
      { key: 'infrastructure', label: 'Infrastructure', icon: 'build' }
    ] as const;

    return (
      <View style={styles.categorySelector}>
        <Text style={styles.sectionTitle}>Impact Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={selectedCategory === category.key ? '#FFFFFF' : THEME_COLOR} 
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.categoryButtonTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCategoryMetrics = () => {
    if (!analysis) return null;

    const categoryData = analysis[`${selectedCategory}Impacts` as keyof SpecificImpactAnalysis];
    if (!categoryData || typeof categoryData !== 'object') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Impact Analysis</Text>
        {Object.entries(categoryData).map(([key, metric]) => (
          <MetricCard key={key} metric={metric as SpecificImpactMetric} />
        ))}
      </View>
    );
  };

  const OverallAssessmentCard = () => {
    if (!analysis) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Assessment</Text>
        <View style={styles.assessmentGrid}>
          <View style={styles.assessmentItem}>
            <Text style={styles.assessmentLabel}>Feasibility</Text>
            <Text style={styles.assessmentValue}>{analysis.overallAssessment.feasibilityScore}/100</Text>
          </View>
          <View style={styles.assessmentItem}>
            <Text style={styles.assessmentLabel}>Complexity</Text>
            <Text style={styles.assessmentValue}>{analysis.overallAssessment.implementationComplexity}</Text>
          </View>
          <View style={styles.assessmentItem}>
            <Text style={styles.assessmentLabel}>Political Viability</Text>
            <Text style={styles.assessmentValue}>{analysis.overallAssessment.politicalViability}/100</Text>
          </View>
          <View style={styles.assessmentItem}>
            <Text style={styles.assessmentLabel}>Timeline</Text>
            <Text style={styles.assessmentValue}>{analysis.overallAssessment.timeToImplementation}</Text>
          </View>
        </View>
        {analysis.overallAssessment.budgetRequirement && (
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Estimated Budget: </Text>
            <Text style={styles.budgetValue}>${analysis.overallAssessment.budgetRequirement}B</Text>
          </View>
        )}
      </View>
    );
  };

  const KeyFindingsCard = () => {
    if (!analysis || analysis.keyFindings.length === 0) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Key Findings</Text>
        {analysis.keyFindings.map((finding, index) => (
          <View key={index} style={styles.findingItem}>
            <Text style={styles.findingBullet}>📊</Text>
            <Text style={styles.findingText}>{finding}</Text>
          </View>
        ))}
      </View>
    );
  };

  const UncertaintiesCard = () => {
    if (!analysis || analysis.majorUncertainties.length === 0) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Major Uncertainties</Text>
        {analysis.majorUncertainties.map((uncertainty, index) => (
          <View key={index} style={styles.uncertaintyItem}>
            <Text style={styles.uncertaintyBullet}>❓</Text>
            <Text style={styles.uncertaintyText}>{uncertainty}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Legislative Impact</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
          <Text style={styles.loadingText}>Analyzing legislative impact...</Text>
          <Text style={styles.loadingSubtext}>Generating specific predictions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legislative Impact</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={THEME_COLOR} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {analysis && (
          <>
            {/* Bill Information */}
            <View style={styles.billInfoCard}>
              <Text style={styles.billName}>{analysis.billName}</Text>
              <Text style={styles.billSummary}>{analysis.billSummary}</Text>
              {analysis.deterministic && (
                <View style={styles.deterministicBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  <Text style={styles.deterministicText}>Deterministic Analysis</Text>
                </View>
              )}
            </View>

            {/* Overall Assessment */}
            <OverallAssessmentCard />

            {/* Category Selector */}
            <CategorySelector />

            {/* Category-specific Metrics */}
            {renderCategoryMetrics()}

            {/* Key Findings */}
            <KeyFindingsCard />

            {/* Uncertainties */}
            <UncertaintiesCard />

            {/* Evidence Gaps */}
            {analysis.evidenceGaps.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Evidence Gaps</Text>
                {analysis.evidenceGaps.map((gap, index) => (
                  <View key={index} style={styles.gapItem}>
                    <Text style={styles.gapBullet}>🔍</Text>
                    <Text style={styles.gapText}>{gap}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommended Monitoring */}
            {analysis.recommendedMonitoring.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Recommended Monitoring</Text>
                {analysis.recommendedMonitoring.map((metric, index) => (
                  <View key={index} style={styles.monitoringItem}>
                    <Text style={styles.monitoringBullet}>📈</Text>
                    <Text style={styles.monitoringText}>{metric}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
  },
  refreshButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginTop: 8,
  },
  billInfoCard: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: THEME_COLOR,
  },
  billName: {
    fontSize: 20,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    marginBottom: 8,
  },
  billSummary: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    lineHeight: 24,
    marginBottom: 12,
  },
  deterministicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  deterministicText: {
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium',
    color: '#22c55e',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 16,
  },
  assessmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  assessmentItem: {
    width: '48%',
    marginBottom: 16,
  },
  assessmentLabel: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginBottom: 4,
  },
  assessmentValue: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  budgetLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
  budgetValue: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: THEME_COLOR,
  },
  categorySelector: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 12,
  },
  categoryScrollView: {
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  categoryButtonActive: {
    backgroundColor: THEME_COLOR,
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium',
    color: THEME_COLOR,
    marginLeft: 8,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  section: {
    marginVertical: 16,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricName: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    flex: 1,
  },
  confidenceBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'WorkSans_600SemiBold',
  },
  metricValue: {
    marginBottom: 12,
  },
  projectedChange: {
    fontSize: 20,
    fontFamily: 'WorkSans_700Bold',
    color: THEME_COLOR,
  },
  changeRange: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginTop: 4,
  },
  insufficientData: {
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    color: '#ef4444',
  },
  metricReasoning: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    lineHeight: 20,
  },
  sectionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionsTitle: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginBottom: 4,
  },
  findingItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  findingBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  findingText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 20,
  },
  uncertaintyItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  uncertaintyBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  uncertaintyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 20,
  },
  gapItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  gapBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  gapText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 20,
  },
  monitoringItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  monitoringBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  monitoringText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 20,
  },
});