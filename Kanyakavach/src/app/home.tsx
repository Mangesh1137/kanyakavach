import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/api";

export default function HomeScreen() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    getCurrentUser().then((user) => setUserName(user.name)).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>KANYAKAVACH</Text>
          <Text style={styles.tagline}>Your Safety. Your Shield.</Text>
        </View>

        <Pressable onPress={() => router.push("/profile")} accessibilityLabel="Open profile">
          <Text style={styles.shield}>🛡️</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>{userName ? `Stay Safe, ${userName}` : "Stay Safe"}</Text>

        <Text style={styles.description}>
          Quick access to your emergency safety tools.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.sosButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/sos")}
        >
          <Text style={styles.sosIcon}>🚨</Text>
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.sosSubtext}>
            Press for emergency help
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionButton, styles.tripButton, pressed && styles.pressed]}
          onPress={() => router.push("/trip")}
        >
          <Text style={styles.actionIcon}>🛣️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Safety Trip</Text>
            <Text style={styles.actionSubtitle}>Start or check your active trip</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Safety Tools</Text>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.locationButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/location")}
        >
          <Text style={styles.actionIcon}>📍</Text>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Location</Text>
            <Text style={styles.actionSubtitle}>
              View your current GPS location
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.contactsButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/contacts")}
        >
          <Text style={styles.actionIcon}>👥</Text>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Emergency Contacts
            </Text>
            <Text style={styles.actionSubtitle}>
              Manage your trusted contacts
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.historyButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/history")}
        >
          <Text style={styles.actionIcon}>📋</Text>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>SOS History</Text>
            <Text style={styles.actionSubtitle}>
              View previous emergency alerts
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>⚠️ Safety Reminder</Text>

          <Text style={styles.infoText}>
            Add trusted emergency contacts before using SOS. In immediate
            danger, contact local emergency services.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },

  header: {
    backgroundColor: "#6C3CE9",
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  appName: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  tagline: {
    color: "#E9E1FF",
    fontSize: 13,
    marginTop: 5,
  },

  shield: {
    fontSize: 42,
  },

  content: {
    padding: 22,
    paddingBottom: 40,
  },

  greeting: {
    color: "#222222",
    fontSize: 25,
    fontWeight: "800",
  },

  description: {
    color: "#707070",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 22,
  },

  sosButton: {
    height: 180,
    borderRadius: 24,
    backgroundColor: "#D62828",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 5,
    shadowColor: "#D62828",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  sosIcon: {
    fontSize: 37,
  },

  sosText: {
    color: "#FFFFFF",
    fontSize: 45,
    fontWeight: "900",
    marginTop: 3,
  },

  sosSubtext: {
    color: "#FFE7E7",
    fontSize: 13,
    fontWeight: "600",
  },

  sectionTitle: {
    color: "#222222",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 13,
  },

  actionButton: {
    minHeight: 78,
    borderRadius: 16,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  locationButton: {
    backgroundColor: "#8B1E3F",
  },

  contactsButton: {
    backgroundColor: "#6C3CE9",
  },

  historyButton: {
    backgroundColor: "#3B7DDD",
  },

  tripButton: {
    backgroundColor: "#27834A",
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  actionIcon: {
    fontSize: 28,
    marginRight: 14,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  actionSubtitle: {
    color: "#F0E8FF",
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "300",
  },

  infoCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },

  infoTitle: {
    color: "#8A5A00",
    fontSize: 14,
    fontWeight: "800",
  },

  infoText: {
    color: "#8A6B32",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
});
