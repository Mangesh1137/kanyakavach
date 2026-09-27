import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Safety Guide</Text>
        <Text style={styles.headerSubtitle}>
          Stay prepared. Stay protected.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>🛡️</Text>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Your safety matters</Text>

            <Text style={styles.heroText}>
              Use Kanyakavach to quickly alert your trusted contacts
              during an emergency.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            styles.sosCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/sos")}
        >
          <Text style={styles.actionIcon}>🚨</Text>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Emergency SOS</Text>
            <Text style={styles.actionText}>
              Send an emergency alert with your location.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            styles.locationCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/location")}
        >
          <Text style={styles.actionIcon}>📍</Text>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Location</Text>
            <Text style={styles.actionText}>
              Check and open your current GPS location.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            styles.contactsCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/contacts")}
        >
          <Text style={styles.actionIcon}>👥</Text>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Emergency Contacts</Text>
            <Text style={styles.actionText}>
              Add and manage people you trust.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Safety Tips</Text>

        <View style={styles.tipCard}>
          <Text style={styles.tipNumber}>1</Text>
          <Text style={styles.tipText}>
            Add at least one trusted emergency contact.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipNumber}>2</Text>
          <Text style={styles.tipText}>
            Keep your phone charged and location permission enabled.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipNumber}>3</Text>
          <Text style={styles.tipText}>
            In immediate danger, press SOS and call local emergency services.
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>⚠️ Important</Text>
          <Text style={styles.noteText}>
            Kanyakavach helps notify trusted contacts. For immediate
            assistance, always contact local emergency services.
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
    paddingBottom: 24,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#E9E1FF",
    fontSize: 14,
    marginTop: 5,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  heroCard: {
    flexDirection: "row",
    backgroundColor: "#EEE8FF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 25,
  },

  heroIcon: {
    fontSize: 38,
    marginRight: 14,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    color: "#4F2AA8",
    fontSize: 17,
    fontWeight: "800",
  },

  heroText: {
    color: "#6D5A99",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  sectionTitle: {
    color: "#222222",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 13,
  },

  actionCard: {
    minHeight: 84,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  sosCard: {
    backgroundColor: "#D62828",
  },

  locationCard: {
    backgroundColor: "#8B1E3F",
  },

  contactsCard: {
    backgroundColor: "#6C3CE9",
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  actionIcon: {
    fontSize: 30,
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

  actionText: {
    color: "#F4ECFF",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "300",
  },

  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EDE5FF",
    color: "#6C3CE9",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 12,
  },

  tipText: {
    flex: 1,
    color: "#4C4C4C",
    fontSize: 13,
    lineHeight: 19,
  },

  noteCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 14,
    padding: 16,
    marginTop: 15,
  },

  noteTitle: {
    color: "#8A5A00",
    fontSize: 14,
    fontWeight: "800",
  },

  noteText: {
    color: "#8A6B32",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
});