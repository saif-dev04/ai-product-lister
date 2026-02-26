import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { Sidebar } from '../components/Layout';
import { useResponsive } from '../lib/useResponsive';

export default function RootLayout() {
  const { showSidebar } = useResponsive();

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {showSidebar && <Sidebar />}
        <View style={[styles.content, showSidebar && styles.contentWithSidebar]}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTitleStyle: {
                fontWeight: '600',
              },
              contentStyle: {
                backgroundColor: '#F2F2F7',
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  contentWithSidebar: {
    ...(Platform.OS === 'web' ? { marginLeft: 260 } : {}),
  },
});
