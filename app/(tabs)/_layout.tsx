import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

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
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerTintColor: '#000000',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
          headerTitle: 'AI Product Lister',
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
