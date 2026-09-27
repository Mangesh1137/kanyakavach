import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { endSafetyTrip, getActiveTrip, startSafetyTrip, type SafetyTrip } from "../lib/api";

export default function SafetyTripScreen() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [expectedTime, setExpectedTime] = useState("");
  const [activeTrip, setActiveTrip] = useState<SafetyTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadActiveTrip();
  }, []);

  const loadActiveTrip = async () => {
    try {
      setActiveTrip(await getActiveTrip());
    } catch (error) {
      console.log("Load trip error:", error);
      Alert.alert("Unable to load trip", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startTrip = async () => {
    const cleanStart = start.trim();
    const cleanDestination = destination.trim();
    const cleanExpectedTime = expectedTime.trim();

    if (!cleanStart || !cleanDestination || !cleanExpectedTime) {
      Alert.alert(
        "Missing Information",
        "Please fill all trip details."
      );
      return;
    }

    setSaving(true);

    try {
      const newTrip = await startSafetyTrip({ start: cleanStart, destination: cleanDestination, expectedTime: cleanExpectedTime });
      setActiveTrip(newTrip);
      setStart("");
      setDestination("");
      setExpectedTime("");

      Alert.alert(
        "Safety Trip Started 🛣️",
        "Your trip has been saved as active."
      );
    } catch (error) {
      console.log("Save trip error:", error);
      Alert.alert("Unable to start trip", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const endTrip = () => {
    Alert.alert(
      "End Safety Trip",
      "Are you sure you want to end this trip?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "End Trip",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);

              if (activeTrip) await endSafetyTrip(activeTrip.id);
              setActiveTrip(null);

              Alert.alert(
                "Trip Completed",
                "Your safety trip has been ended."
              );
            } catch (error) {
              console.log("End trip error:", error);
              Alert.alert("Unable to end trip", error instanceof Error ? error.message : "Please try again.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C3CE9" />
        <Text style={styles.loadingText}>Loading trip...</Text>
      </View>
    );
  }

  const tripStarted = activeTrip !== null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Safety Trip</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.statusCard,
            tripStarted && styles.activeStatus,
          ]}
        >
          <View
            style={[
              styles.statusCircle,
              tripStarted && styles.activeCircle,
            ]}
          >
            <Text style={styles.statusIcon}>
              {tripStarted ? "✓" : "🛣️"}
            </Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {tripStarted ? "Trip is Active" : "No Active Trip"}
            </Text>

            <Text style={styles.statusSubtitle}>
              {tripStarted
                ? "Remember to end the trip after reaching safely."
                : "Start a trip before travelling alone."}
            </Text>
          </View>
        </View>

        {!tripStarted ? (
          <>
            <Text style={styles.heading}>Plan Your Safety Trip</Text>

            <Text style={styles.description}>
              Save your route details before starting your journey.
            </Text>

            <Text style={styles.label}>Starting Point</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🟢</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter starting point"
                placeholderTextColor="#999"
                value={start}
                onChangeText={setStart}
                editable={!saving}
              />
            </View>

            <Text style={styles.label}>Destination</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔴</Text>

              <TextInput
                style={styles.input}
                placeholder="Where are you going?"
                placeholderTextColor="#999"
                value={destination}
                onChangeText={setDestination}
                editable={!saving}
              />
            </View>

            <Text style={styles.label}>Expected Travel Time</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>⏱️</Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. 30 minutes"
                placeholderTextColor="#999"
                value={expectedTime}
                onChangeText={setExpectedTime}
                editable={!saving}
                onSubmitEditing={startTrip}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                saving && styles.disabledButton,
              ]}
              onPress={startTrip}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.startIcon}>▶</Text>
                  <Text style={styles.buttonText}>
                    START SAFETY TRIP
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.tripCard}>
              <Text style={styles.tripTitle}>🛣️ Trip Details</Text>

              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>From</Text>
                <Text style={styles.tripValue}>
                  {activeTrip.start}
                </Text>
              </View>

              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>To</Text>
                <Text style={styles.tripValue}>
                  {activeTrip.destination}
                </Text>
              </View>

              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>Expected Time</Text>
                <Text style={styles.tripValue}>
                  {activeTrip.expectedTime}
                </Text>
              </View>

              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>Started</Text>
                <Text style={styles.tripValue}>
                  {new Date(activeTrip.startedAt).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.monitorCard}>
              <Text style={styles.monitorIcon}>🛡️</Text>

              <Text style={styles.monitorTitle}>
                Safety Trip Active
              </Text>

              <Text style={styles.monitorText}>
                Your trip details are saved in Kanyakavach.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.endButton,
                saving && styles.disabledButton,
              ]}
              onPress={endTrip}
              disabled={saving}
            >
              <Text style={styles.endIcon}>■</Text>
              <Text style={styles.endText}>END TRIP</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Safety Tip</Text>

          <Text style={styles.infoText}>
            Start a Safety Trip before travelling alone. For real-time
            location tracking, background-location permission and a secure
            server are needed.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F7FC",
  },

  loadingText: {
    color: "#6C3CE9",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
  },

  header: {
    height: 90,
    paddingTop: 35,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 34,
    color: "#333333",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
  },

  headerSpace: {
    width: 42,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
  },

  activeStatus: {
    backgroundColor: "#EAF8EF",
  },

  statusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEE8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  activeCircle: {
    backgroundColor: "#34A853",
  },

  statusIcon: {
    fontSize: 22,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },

  statusSubtitle: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
    lineHeight: 17,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222222",
  },

  description: {
    fontSize: 13,
    color: "#777777",
    marginTop: 6,
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginTop: 12,
    marginBottom: 7,
  },

  inputContainer: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#222222",
  },

  startButton: {
    height: 55,
    backgroundColor: "#6C3CE9",
    borderRadius: 12,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.65,
  },

  startIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    marginRight: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
  },

  tripTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 7,
  },

  tripRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingVertical: 11,
  },

  tripLabel: {
    color: "#888888",
    fontSize: 13,
    maxWidth: "35%",
  },

  tripValue: {
    color: "#333333",
    fontSize: 13,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  monitorCard: {
    backgroundColor: "#EAF8EF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 18,
  },

  monitorIcon: {
    fontSize: 35,
  },

  monitorTitle: {
    color: "#247A3D",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },

  monitorText: {
    color: "#5D8066",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },

  endButton: {
    height: 52,
    backgroundColor: "#E53935",
    borderRadius: 12,
    marginTop: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  endIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 8,
  },

  endText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  infoCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },

  infoTitle: {
    color: "#8A5A00",
    fontWeight: "bold",
    fontSize: 14,
  },

  infoText: {
    color: "#8A6B32",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
});
