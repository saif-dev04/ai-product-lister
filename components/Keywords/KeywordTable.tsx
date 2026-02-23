import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { copyToClipboard } from '../../lib/clipboard';

type Keyword = {
  keyword: string;
  relevance: 'high' | 'medium' | 'low';
  reason: string;
};

type KeywordTableProps = {
  keywords: Keyword[];
  onAddKeyword?: (keyword: string) => void;
  existingTags?: string[];
};

export function KeywordTable({ keywords, onAddKeyword, existingTags = [] }: KeywordTableProps) {
  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return '#34C759';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getRelevanceBg = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return '#E8F5E9';
      case 'medium':
        return '#FFF3E0';
      case 'low':
        return '#F2F2F7';
      default:
        return '#F2F2F7';
    }
  };

  const handleCopyAll = async () => {
    const allKeywords = keywords.map((k) => k.keyword).join(', ');
    await copyToClipboard(allKeywords);
  };

  const isAlreadyAdded = (keyword: string) => {
    return existingTags.some((tag) => tag.toLowerCase() === keyword.toLowerCase());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suggested Keywords</Text>
        <TouchableOpacity onPress={handleCopyAll} style={styles.copyAllButton}>
          <Text style={styles.copyAllText}>Copy All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
          <Text style={styles.legendText}>Medium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8E8E93' }]} />
          <Text style={styles.legendText}>Low</Text>
        </View>
      </View>

      <ScrollView style={styles.tableContainer} nestedScrollEnabled>
        {keywords.map((item, index) => {
          const added = isAlreadyAdded(item.keyword);
          return (
            <View key={index} style={styles.row}>
              <View style={styles.keywordInfo}>
                <View style={styles.keywordHeader}>
                  <View
                    style={[
                      styles.relevanceBadge,
                      { backgroundColor: getRelevanceBg(item.relevance) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.relevanceText,
                        { color: getRelevanceColor(item.relevance) },
                      ]}
                    >
                      {item.relevance.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.keywordText}>{item.keyword}</Text>
                </View>
                <Text style={styles.reasonText}>{item.reason}</Text>
              </View>
              {onAddKeyword && (
                <TouchableOpacity
                  style={[styles.addButton, added && styles.addButtonDisabled]}
                  onPress={() => !added && onAddKeyword(item.keyword)}
                  disabled={added}
                >
                  <Text style={[styles.addButtonText, added && styles.addButtonTextDisabled]}>
                    {added ? 'Added' : '+ Add'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copyAllButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  copyAllText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  tableContainer: {
    maxHeight: 400,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  keywordInfo: {
    flex: 1,
    gap: 4,
  },
  keywordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relevanceBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  relevanceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  keywordText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  reasonText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#E8F0FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#F2F2F7',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#8E8E93',
  },
});
