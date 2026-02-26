import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

type NavItem = {
  path: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/editor', label: 'Image Editor', icon: '🎨' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '/index';
    return pathname.startsWith(path);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>✨ AI Product Lister</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={[styles.navItem, isActive(item.path) && styles.navItemActive]}
            onPress={() => router.push(item.path as any)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, isActive(item.path) && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
        <Text style={styles.footerSubtext}>Web Edition</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
    height: '100%',
    ...(Platform.OS === 'web' ? { position: 'fixed' as any, left: 0, top: 0, bottom: 0 } : {}),
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  nav: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#E8F0FE',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  navLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#C7C7CC',
    marginTop: 2,
  },
});
