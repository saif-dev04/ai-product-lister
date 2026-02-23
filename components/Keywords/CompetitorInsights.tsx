import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { copyToClipboard } from '../../lib/clipboard';

type CompetitorInsightsProps = {
  insights: {
    typicalPriceRange: { low: number; high: number };
    commonKeywords: string[];
    differentiators: string[];
  };
};

export function CompetitorInsights({ insights }: CompetitorInsightsProps) {
  const handleCopyKeywords = async () => {
    await copyToClipboard(insights.commonKeywords.join(', '));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Competitor Insights</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Typical Price Range</Text>
        <Text style={styles.priceText}>
          ${insights.typicalPriceRange.low} - ${insights.typicalPriceRange.high}
        </Text>
        <Text style={styles.hint}>Based on similar products in the market</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Common Keywords</Text>
          <TouchableOpacity onPress={handleCopyKeywords}>
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keywordsContainer}>
          {insights.commonKeywords.map((keyword, index) => (
            <View key={index} style={styles.keywordChip}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.hint}>Keywords commonly used by top sellers</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stand Out By</Text>
        {insights.differentiators.map((diff, index) => (
          <View key={index} style={styles.diffItem}>
            <Text style={styles.diffIcon}>💡</Text>
            <Text style={styles.diffText}>{diff}</Text>
          </View>
        ))}
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  copyText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  keywordText: {
    fontSize: 13,
    color: '#333333',
  },
  diffItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  diffIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  diffText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
});
