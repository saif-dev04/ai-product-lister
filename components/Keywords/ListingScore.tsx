import { View, Text, StyleSheet } from 'react-native';

type ScoreBreakdown = {
  titleQuality: number;
  descriptionCompleteness: number;
  tagRelevance: number;
  keywordOptimization: number;
};

type ListingScoreProps = {
  score: number;
  breakdown: ScoreBreakdown;
};

function ScoreCircle({ score }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return '#34C759';
    if (s >= 60) return '#FFD60A';
    if (s >= 40) return '#FF9500';
    return '#FF3B30';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <View style={styles.scoreCircleContainer}>
      <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
        <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>
      <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>
        {getScoreLabel(score)}
      </Text>
    </View>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getBarColor = (s: number) => {
    if (s >= 80) return '#34C759';
    if (s >= 60) return '#FFD60A';
    if (s >= 40) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <Text style={styles.scoreBarLabel}>{label}</Text>
        <Text style={styles.scoreBarValue}>{score}</Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${score}%`, backgroundColor: getBarColor(score) },
          ]}
        />
      </View>
    </View>
  );
}

export function ListingScore({ score, breakdown }: ListingScoreProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listing Score</Text>

      <ScoreCircle score={score} />

      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Score Breakdown</Text>
        <ScoreBar label="Title Quality" score={breakdown.titleQuality} />
        <ScoreBar label="Description" score={breakdown.descriptionCompleteness} />
        <ScoreBar label="Tag Relevance" score={breakdown.tagRelevance} />
        <ScoreBar label="Keywords" score={breakdown.keywordOptimization} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 14,
    color: '#8E8E93',
  },
  scoreLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownContainer: {
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  scoreBarContainer: {
    gap: 4,
  },
  scoreBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreBarLabel: {
    fontSize: 14,
    color: '#000000',
  },
  scoreBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  scoreBarTrack: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
