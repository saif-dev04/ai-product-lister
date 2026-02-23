import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { copyToClipboard } from '../../lib/clipboard';

type TagManagerProps = {
  tags: string[];
  onUpdate: (tags: string[]) => void;
  maxTags?: number;
};

export function TagManager({ tags, onUpdate, maxTags = 13 }: TagManagerProps) {
  const [newTag, setNewTag] = useState('');

  const handleCopyAll = async () => {
    await copyToClipboard(tags.join(', '));
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < maxTags) {
      onUpdate([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onUpdate(newTags);
  };

  if (tags.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Tags</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tags generated yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Tags</Text>
          <Text style={styles.tagCount}>{tags.length}/{maxTags} tags</Text>
        </View>
        <TouchableOpacity onPress={handleCopyAll} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>Copy All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag(index)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {tags.length < maxTags && (
        <View style={styles.addContainer}>
          <TextInput
            style={styles.addInput}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Add a tag..."
            placeholderTextColor="#8E8E93"
            onSubmitEditing={handleAddTag}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={handleAddTag}
            style={[styles.addButton, !newTag.trim() && styles.addButtonDisabled]}
            disabled={!newTag.trim()}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  copyButtonText: {
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 4,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    lineHeight: 18,
  },
  addContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
