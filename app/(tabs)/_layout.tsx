import { Tabs } from 'expo-router';
import { Text, View, Platform } from 'react-native';
import { useResponsive } from '../../lib/useResponsive';

type TabIconProps = {
  name: string;
  focused: boolean;
};

function TabIcon({ name, focused }: TabIconProps) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Editor: '🎨',
    Products: '📦',
    Settings: '⚙️',
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>
        {icons[name] || '📱'}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { showSidebar, isDesktop } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerTintColor: '#000000',
        // Hide tab bar on desktop when sidebar is shown
        tabBarStyle: showSidebar ? { display: 'none' } : undefined,
        // Better header for web
        headerStyle: {
          backgroundColor: '#FFFFFF',
          ...(Platform.OS === 'web' ? {
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5EA',
          } : {}),
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: isDesktop ? 20 : 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
          headerTitle: showSidebar ? 'Dashboard' : 'AI Product Lister',
        }}
      />
      <Tabs.Screen
        name="editor"
        options={{
          title: 'Editor',
          tabBarIcon: ({ focused }) => <TabIcon name="Editor" focused={focused} />,
          headerTitle: 'Image Editor',
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => <TabIcon name="Products" focused={focused} />,
          headerTitle: 'My Products',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="Settings" focused={focused} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}
