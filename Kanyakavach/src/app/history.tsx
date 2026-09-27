import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getSosHistory, type SOSHistory } from "../lib/api";

export default function HistoryScreen() {
  const [events, setEvents] = useState<SOSHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getSosHistory()
      .then((rows) => { if (active) setEvents(rows); })
      .catch((error) => { if (active) Alert.alert("Unable to load SOS history", error instanceof Error ? error.message : "Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.title}>SOS History</Text>
        <View style={styles.back} />
      </View>
      {loading ? <ActivityIndicator style={styles.loading} size="large" color="#6C3CE9" /> : (
        <ScrollView contentContainerStyle={styles.content}>
          {events.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No SOS alerts yet</Text><Text style={styles.emptyText}>Your SOS events will appear here.</Text></View> : events.map((event) => (
            <View key={event.id} style={styles.card}>
              <View style={styles.row}><Text style={styles.eventTitle}>🚨 SOS Alert</Text><Text style={[styles.status, event.status === "sent" && styles.sent]}>{event.status.toUpperCase()}</Text></View>
              <Text style={styles.date}>{new Date(event.date).toLocaleString()}</Text>
              <Text style={styles.detail}>📍 {Number(event.latitude).toFixed(5)}, {Number(event.longitude).toFixed(5)}</Text>
              <Text style={styles.detail}>👥 {event.contactsCount} emergency contact(s)</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F7FC" },
  header: { height: 90, paddingTop: 35, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F1F1F1", justifyContent: "center", alignItems: "center" },
  backText: { fontSize: 34, color: "#333", marginTop: -4 },
  title: { fontSize: 20, fontWeight: "bold", color: "#222" },
  loading: { flex: 1 },
  content: { padding: 20 },
  empty: { backgroundColor: "#FFF", borderRadius: 16, padding: 28, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  emptyText: { fontSize: 14, color: "#777", marginTop: 8 },
  card: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eventTitle: { color: "#222", fontSize: 16, fontWeight: "bold" },
  status: { color: "#8A5A00", fontSize: 11, fontWeight: "bold" },
  sent: { color: "#27834A" },
  date: { color: "#777", fontSize: 12, marginTop: 8 },
  detail: { color: "#555", fontSize: 13, marginTop: 8 },
});
