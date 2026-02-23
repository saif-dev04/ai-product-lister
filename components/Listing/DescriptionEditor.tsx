import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { copyToClipboard } from '../../lib/clipboard';

type DescriptionData = {
  overview: string;
  features: string[];
  materials: string;
  care: string;
};

type DescriptionEditorProps = {
  description: DescriptionData | null;
  onUpdate: (description: DescriptionData) => void;
};

export function DescriptionEditor({ description, onUpdate }: DescriptionEditorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  if (!description) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Description</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No description generated yet</Text>
        </View>
      </View>
    );
  }

  const getFullDescription = () => {
    const parts = [
      description.overview,
      '',
      'Features:',
      ...description.features.map((f) => `• ${f}`),
      '',
      'Materials:',
      description.materials,
      '',
      'Care Instructions:',
      description.care,
    ];
    return parts.join('\n');
  };

  const handleCopyAll = async () => {
    await copyToClipboard(getFullDescription());
  };

  const handleCopySection = async (text: string) => {
    await copyToClipboard(text);
  };

  const sections = [
    { key: 'overview', title: 'Overview', content: description.overview },
    { key: 'features', title: 'Features', content: description.features.map((f) => `• ${f}`).join('\n') },
    { key: 'materials', title: 'Materials', content: description.materials },
    { key: 'care', title: 'Care Instructions', content: description.care },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Description</Text>
        <TouchableOpacity onPress={handleCopyAll} style={styles.copyAllButton}>
          <Text style={styles.copyAllButtonText}>Copy All</Text>
        </TouchableOpacity>
      </View>

      {sections.map((section) => (
        <View key={section.key} style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleCopySection(section.content);
                }}
                style={styles.sectionCopyButton}
              >
                <Text style={styles.sectionCopyText}>Copy</Text>
              </TouchableOpacity>
              <Text style={styles.expandIcon}>
                {expandedSection === section.key ? '▼' : '▶'}
              </Text>
            </View>
          </TouchableOpacity>

          {expandedSection === section.key && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{section.content}</Text>
            </View>
          )}
        </View>
      ))}
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
    marginBottom: 16,
  },
  label: {
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
  copyAllButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionCopyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sectionCopyText: {
    color: '#007AFF',
    fontSize: 13,
  },
  expandIcon: {
    fontSize: 12,
    color: '#8E8E93',
  },
  sectionContent: {
    paddingBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
});
