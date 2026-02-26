import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { ReactNode } from 'react';
import { useResponsive } from '../../lib/useResponsive';

type ResponsiveContainerProps = {
  children: ReactNode;
  scrollable?: boolean;
  noPadding?: boolean;
  fullWidth?: boolean;
};

export function ResponsiveContainer({
  children,
  scrollable = true,
  noPadding = false,
  fullWidth = false,
}: ResponsiveContainerProps) {
  const { showSidebar, contentMaxWidth, spacing, isDesktop } = useResponsive();

  const containerStyle = [
    styles.container,
    showSidebar && styles.withSidebar,
  ];

  const contentStyle = [
    styles.content,
    !fullWidth && { maxWidth: contentMaxWidth },
    !noPadding && { padding: spacing.md },
    isDesktop && !noPadding && { padding: spacing.lg },
  ];

  if (scrollable) {
    return (
      <View style={containerStyle}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  withSidebar: {
    ...(Platform.OS === 'web' ? { marginLeft: 260 } : {}),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});
