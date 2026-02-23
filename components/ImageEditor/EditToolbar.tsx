import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

type EditToolbarProps = {
  onRemoveBackground: () => void;
  onGenerateVariations: () => void;
  onDownload: () => void;
  onSaveProduct: () => void;
  isProcessing: boolean;
  hasImage: boolean;
  hasEdits: boolean;
};

type ToolButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
};

function ToolButton({ icon, label, onPress, disabled, primary }: ToolButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.toolButton,
        primary && styles.toolButtonPrimary,
        disabled && styles.toolButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.toolIcon}>{icon}</Text>
      <Text
        style={[
          styles.toolLabel,
          primary && styles.toolLabelPrimary,
          disabled && styles.toolLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function EditToolbar({
  onRemoveBackground,
  onGenerateVariations,
  onDownload,
  onSaveProduct,
  isProcessing,
  hasImage,
  hasEdits,
}: EditToolbarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ToolButton
          icon="🪄"
          label="Remove BG"
          onPress={onRemoveBackground}
          disabled={!hasImage || isProcessing}
        />
        <ToolButton
          icon="🎨"
          label="Variations"
          onPress={onGenerateVariations}
          disabled={!hasImage || isProcessing}
        />
        <ToolButton
          icon="💾"
          label="Download"
          onPress={onDownload}
          disabled={!hasImage || isProcessing}
        />
        <ToolButton
          icon="✅"
          label="Save Product"
          onPress={onSaveProduct}
          disabled={!hasImage || isProcessing}
          primary
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 4,
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minWidth: 80,
  },
  toolButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  toolButtonDisabled: {
    opacity: 0.5,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  toolLabelPrimary: {
    color: '#FFFFFF',
  },
  toolLabelDisabled: {
    color: '#8E8E93',
  },
});
