import { View, Text, StyleSheet } from 'react-native';

type ImprovementsListProps = {
  improvements: string[];
};

export function ImprovementsList({ improvements }: ImprovementsListProps) {
  if (improvements.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested Improvements</Text>

      {improvements.map((improvement, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.bullet}>
            <Text style={styles.bulletText}>{index + 1}</Text>
          </View>
          <Text style={styles.itemText}>{improvement}</Text>
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
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bulletText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },
});
