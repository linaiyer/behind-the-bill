import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ImpactScore } from '../../types/simulator';

interface ImpactMeterProps {
  score: ImpactScore;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export const ImpactMeter: React.FC<ImpactMeterProps> = ({ score, category }) => {
  const getImpactColor = (impact: number): string => {
    if (impact > 50) return '#4CAF50'; // Strong positive
    if (impact > 20) return '#8BC34A'; // Moderate positive
    if (impact > -20) return '#FFC107'; // Neutral/minimal
    if (impact > -50) return '#FF9800'; // Moderate negative
    return '#F44336'; // Strong negative
  };

  const getImpactDescription = (impact: number): string => {
    if (impact > 50) return 'Strong Positive';
    if (impact > 20) return 'Moderate Positive';
    if (impact > -20) return 'Minimal Impact';
    if (impact > -50) return 'Moderate Negative';
    return 'Strong Negative';
  };

  const getTimeframeLabel = (timeframe: string): string => {
    switch (timeframe) {
      case 'immediate': return '0-1 years';
      case 'short_term': return '1-3 years';
      case 'medium_term': return '3-7 years';
      case 'long_term': return '7+ years';
      default: return '3-7 years';
    }
  };

  const meterWidth = Math.abs(score.impact);
  const isPositive = score.impact >= 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={[styles.impactScore, { color: getImpactColor(score.impact) }]}>
            {score.impact > 0 ? '+' : ''}{score.impact}
          </Text>
          <Text style={styles.confidenceText}>{score.confidence}% confidence</Text>
        </View>
      </View>

      {/* Impact Meter Bar */}
      <View style={styles.meterContainer}>
        <View style={styles.meterBackground}>
          <View style={styles.centerLine} />
          <View 
            style={[
              styles.meterFill,
              {
                width: `${meterWidth}%`,
                backgroundColor: getImpactColor(score.impact),
                [isPositive ? 'right' : 'left']: '50%',
              }
            ]} 
          />
        </View>
        <View style={styles.meterLabels}>
          <Text style={styles.meterLabel}>Negative</Text>
          <Text style={styles.meterLabel}>Neutral</Text>
          <Text style={styles.meterLabel}>Positive</Text>
        </View>
      </View>

      {/* Impact Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Impact Level:</Text>
          <Text style={[styles.detailValue, { color: getImpactColor(score.impact) }]}>
            {getImpactDescription(score.impact)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Timeframe:</Text>
          <Text style={styles.detailValue}>{getTimeframeLabel(score.timeframe)}</Text>
        </View>
      </View>

      {/* Reasoning */}
      <View style={styles.reasoningContainer}>
        <Text style={styles.reasoningText}>{score.reasoning}</Text>
      </View>

      {/* Historical Precedents */}
      {score.historicalPrecedents.length > 0 && (
        <View style={styles.precedentsContainer}>
          <Text style={styles.precedentsTitle}>Similar Policies:</Text>
          {score.historicalPrecedents.slice(0, 2).map((precedent, index) => (
            <Text key={index} style={styles.precedentText}>• {precedent}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#111111',
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  impactScore: {
    fontSize: 24,
    fontFamily: 'WorkSans_700Bold',
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: '#6B6B6B',
    marginTop: 2,
  },
  meterContainer: {
    marginBottom: 16,
  },
  meterBackground: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E0E0E0',
    marginLeft: -1,
  },
  meterFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLabel: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: '#6B6B6B',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium',
    color: '#6B6B6B',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#111111',
  },
  reasoningContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasoningText: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: '#111111',
    lineHeight: 20,
  },
  precedentsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  precedentsTitle: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#111111',
    marginBottom: 8,
  },
  precedentText: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: '#6B6B6B',
    marginBottom: 4,
    lineHeight: 16,
  },
});