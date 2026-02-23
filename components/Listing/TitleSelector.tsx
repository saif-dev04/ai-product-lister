import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { copyToClipboard } from '../../lib/clipboard';

type TitleSelectorProps = {
  titles: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onEdit: (title: string) => void;
};

export function TitleSelector({ titles, selectedIndex, onSelect, onEdit }: TitleSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(titles[selectedIndex] || '');

  const handleCopy = async () => {
    const success = await copyToClipboard(titles[selectedIndex] || '');
    if (success) {
      // Could show a toast here
    }
  };

  const handleSaveEdit = () => {
    onEdit(editedTitle);
    setIsEditing(false);
  };

  if (titles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Title</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No titles generated yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Title</Text>
        <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>Copy</Text>
        </TouchableOpacity>
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editedTitle}
            onChangeText={setEditedTitle}
            multiline
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={() => {
            setEditedTitle(titles[selectedIndex] || '');
            setIsEditing(true);
          }}>
            <Text style={styles.selectedTitle}>{titles[selectedIndex]}</Text>
          </TouchableOpacity>

          <Text style={styles.optionsLabel}>Other options:</Text>
          <View style={styles.optionsContainer}>
            {titles.map((title, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionChip,
                  selectedIndex === index && styles.optionChipSelected,
                ]}
                onPress={() => onSelect(index)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedIndex === index && styles.optionTextSelected,
                  ]}
                  numberOfLines={2}
                >
                  {index + 1}. {title.slice(0, 50)}...
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  selectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  optionsContainer: {
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionChipSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F0FE',
  },
  optionText: {
    fontSize: 13,
    color: '#666666',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
