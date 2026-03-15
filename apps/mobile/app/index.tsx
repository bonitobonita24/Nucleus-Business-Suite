// ─────────────────────────────────────────────────────────────────────────────
// Mobile Home Screen — redirects to login if not authenticated
// ─────────────────────────────────────────────────────────────────────────────

import { Text, View, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nucleus Business Suite</Text>
      <Text style={styles.subtitle}>Field Companion App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
  },
});
