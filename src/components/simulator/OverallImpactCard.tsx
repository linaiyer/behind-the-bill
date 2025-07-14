import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OverallImpactCardProps {
  overallImpact: number;
  politicalFeasibility: number;
  implementationComplexity: number;
  billName: string;
}

export const OverallImpactCard: React.FC<OverallImpactCardProps> = ({
  overallImpact,
  politicalFeasibility,
  implementationComplexity,
  billName
}) => {
  const getOverallImpactColor = (impact: number): string => {
    if (impact > 40) return '#4CAF50';
    if (impact > 10) return '#8BC34A';
    if (impact > -10) return '#FFC107';
    if (impact > -40) return '#FF9800';
    return '#F44336';
  };

  const getOverallImpactDescription = (impact: number): string => {
    if (impact > 40) return 'Highly Beneficial';
    if (impact > 10) return 'Moderately Beneficial';
    if (impact > -10) return 'Mixed Impact';
    if (impact > -40) return 'Moderately Concerning';
    return 'Highly Concerning';
  };

  const getFeasibilityColor = (feasibility: number): string => {
    if (feasibility > 70) return '#4CAF50';
    if (feasibility > 40) return '#FFC107';
    return '#FF9800';
  };

  const getComplexityColor = (complexity: number): string => {
    if (complexity < 30) return '#4CAF50';
    if (complexity < 60) return '#FFC107';
    return '#FF9800';
  };

  const CircularProgress = ({ 
    value, 
    color, 
    size = 60 
  }: { 
    value: number; 
    color: string; 
    size?: number; 
  }) => {
    // Simple circular progress representation
    return (
      <View style={[styles.circularProgress, { 
        width: size, 
        height: size, 
        borderColor: color + '20' 
      }]}>
        <View style={[styles.circularProgressFill, {
          width: size - 8,
          height: size - 8,
          borderColor: color,
          borderWidth: Math.max(2, (value / 100) * 4),
        }]} />
        <Text style={[styles.circularProgressText, { 
          fontSize: size / 4,
          color: color 
        }]}>
          {value}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Overall Impact Analysis</Text>
        <Text style={styles.billName}>{billName}</Text>
      </View>

      {/* Main Impact Score */}
      <View style={styles.mainImpactContainer}>
        <View style={styles.impactScoreSection}>
          <Text style={[styles.impactScore, { color: getOverallImpactColor(overallImpact) }]}>
            {overallImpact > 0 ? '+' : ''}{overallImpact}
          </Text>
          <Text style={styles.impactLabel}>Overall Impact</Text>
          <Text style={[styles.impactDescription, { color: getOverallImpactColor(overallImpact) }]}>
            {getOverallImpactDescription(overallImpact)}
          </Text>
        </View>

        {/* Impact Scale */}
        <View style={styles.impactScale}>
          <View style={styles.scaleContainer}>
            <View style={styles.scaleBackground}>
              <View 
                style={[
                  styles.scaleIndicator,
                  {
                    left: `${Math.max(0, Math.min(100, (overallImpact + 100) / 2))}%`,
                    backgroundColor: getOverallImpactColor(overallImpact),
                  }
                ]}
              />
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>-100</Text>
              <Text style={styles.scaleLabel}>0</Text>
              <Text style={styles.scaleLabel}>+100</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Secondary Metrics */}
      <View style={styles.secondaryMetrics}>
        <View style={styles.metricItem}>
          <CircularProgress 
            value={politicalFeasibility} 
            color={getFeasibilityColor(politicalFeasibility)} 
          />
          <Text style={styles.metricLabel}>Political{'\n'}Feasibility</Text>
        </View>

        <View style={styles.metricItem}>
          <CircularProgress 
            value={100 - implementationComplexity} 
            color={getComplexityColor(implementationComplexity)} 
          />
          <Text style={styles.metricLabel}>Implementation{'\n'}Ease</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          This legislation is predicted to have a{' '}
          <Text style={[styles.summaryHighlight, { color: getOverallImpactColor(overallImpact) }]}>
            {getOverallImpactDescription(overallImpact).toLowerCase()}
          </Text>
          {' '}impact overall, with{' '}
          <Text style={[styles.summaryHighlight, { color: getFeasibilityColor(politicalFeasibility) }]}>
            {politicalFeasibility > 70 ? 'high' : politicalFeasibility > 40 ? 'moderate' : 'low'} political feasibility
          </Text>
          {' '}and{' '}
          <Text style={[styles.summaryHighlight, { color: getComplexityColor(implementationComplexity) }]}>
            {implementationComplexity < 30 ? 'low' : implementationComplexity < 60 ? 'moderate' : 'high'} implementation complexity
          </Text>.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'WorkSans_700Bold',
    color: '#111111',
    marginBottom: 4,
  },
  billName: {
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    color: '#6B6B6B',
  },
  mainImpactContainer: {
    marginBottom: 24,
  },
  impactScoreSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  impactScore: {
    fontSize: 48,
    fontFamily: 'WorkSans_700Bold',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    color: '#6B6B6B',
    marginBottom: 4,
  },
  impactDescription: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
  },
  impactScale: {
    paddingHorizontal: 20,
  },
  scaleContainer: {
    position: 'relative',
  },
  scaleBackground: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
  },
  scaleIndicator: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleLabel: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: '#6B6B6B',
  },
  secondaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'WorkSans_500Medium',
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  circularProgress: {
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularProgressFill: {
    position: 'absolute',
    borderRadius: 50,
  },
  circularProgressText: {
    fontFamily: 'WorkSans_700Bold',
  },
  summary: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: '#111111',
    lineHeight: 20,
    textAlign: 'center',
  },
  summaryHighlight: {
    fontFamily: 'WorkSans_600SemiBold',
  },
});