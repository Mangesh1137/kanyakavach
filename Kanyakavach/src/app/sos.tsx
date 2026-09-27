import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import { getContacts, saveSosEvent, type SOSHistory } from "../lib/api";

export default function SOSScreen() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sosActivated, setSosActivated] = useState(false);
  const [sending, setSending] = useState(false);

  const sendEmergencySMS = async () => {
    try {
      setSending(true);

      const smsAvailable = Platform.OS === "web" ? false : await SMS.isAvailableAsync();

      if (!smsAvailable && Platform.OS !== "web") {
        Alert.alert(
          "SMS Not Available",
          "SMS service is not available on this device."
        );
        return;
      }

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please allow location permission to send your emergency location."
        );
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;

      const contacts = await getContacts();

      if (!contacts.length) {
        Alert.alert(
          "No Emergency Contacts",
          "Please add at least one emergency contact first."
        );
        return;
      }

      const mapsLink =
        `https://www.google.com/maps?q=${latitude},${longitude}`;

      const phoneNumbers = contacts.map(
        (contact) => contact.phone
      );

      const message =
        `🚨 EMERGENCY!\n\n` +
        `I need help. Please contact me immediately.\n\n` +
        `📍 My current location:\n` +
        `${mapsLink}\n\n` +
        `Kanyakavach Emergency Alert`;

      let historyStatus: SOSHistory["status"] = "prepared";

      if (smsAvailable) {
        const smsResult = await SMS.sendSMSAsync(phoneNumbers, message);
        if (smsResult.result === "sent") historyStatus = "sent";
        if (smsResult.result === "cancelled") historyStatus = "cancelled";
      }

      try {
        await saveSosEvent({
          latitude,
          longitude,
          contactsCount: contacts.length,
          status: historyStatus,
        });
      } catch (error) {
        Alert.alert("SOS history not synced", error instanceof Error ? error.message : "The event could not be saved to the server.");
      }

      if (historyStatus === "cancelled") {
        setSosActivated(false);

        Alert.alert(
          "SMS Cancelled",
          "Your emergency message was cancelled."
        );
        return;
      }

      setSosActivated(true);

      if (historyStatus === "sent") {
        Alert.alert(
          "SOS Sent 🚨",
          `Emergency alert was sent to ${contacts.length} contact(s).`
        );
      } else {
        Alert.alert(
          "SOS Prepared",
          Platform.OS === "web"
            ? "The SOS event was saved. To send an emergency SMS, use Kanyakavach on your phone."
            : "The SMS app was opened. Please confirm sending the message."
        );
      }
    } catch (error) {
      console.log("SOS Error:", error);
      setSosActivated(false);

      Alert.alert(
        "SOS Error",
        "Unable to prepare emergency SMS. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (countdown === null) {
      return;
    }

    if (countdown === 0) {
      setCountdown(null);
      sendEmergencySMS();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((current) =>
        current === null ? null : current - 1
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startSOS = () => {
    setSosActivated(false);
    setCountdown(5);
  };

  const cancelSOS = () => {
    setCountdown(null);
    setSosActivated(false);
  };

  const handleSOSButton = () => {
    if (sending) {
      return;
    }

    if (sosActivated) {
      router.push("/history");
      return;
    }

    if (countdown !== null) {
      cancelSOS();
      return;
    }

    Alert.alert(
      "Emergency SOS",
      "SOS will start in 5 seconds. You can cancel it during the countdown.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Start SOS",
          style: "destructive",
          onPress: startSOS,
        },
      ]
    );
  };

  const getQuestion = () => {
    if (sending) {
      return "Preparing Emergency Alert...";
    }

    if (sosActivated) {
      return "SOS Alert Activated!";
    }

    if (countdown !== null) {
      return "SOS will be activated in...";
    }

    return "Are you in danger?";
  };

  const getDescription = () => {
    if (sending) {
      return "Getting your location and opening the SMS app.";
    }

    if (sosActivated) {
      return "Your SOS alert has been recorded in history.";
    }

    if (countdown !== null) {
      return "Tap CANCEL if this was pressed by mistake.";
    }

    return "Press the button below to start an emergency alert.";
  };

  const getButtonText = () => {
    if (sending) {
      return "PLEASE WAIT";
    }

    if (countdown !== null) {
      return "CANCEL";
    }

    if (sosActivated) {
      return "VIEW HISTORY";
    }

    return "SOS";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={sending}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Emergency SOS</Text>

        <TouchableOpacity
          onPress={() => router.push("/history")}
          style={styles.historyButton}
          disabled={sending}
        >
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>{getQuestion()}</Text>

        <Text style={styles.description}>{getDescription()}</Text>

        {countdown !== null && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.sosButton,
            sosActivated && styles.sosActivated,
            sending && styles.sosDisabled,
          ]}
          onPress={handleSOSButton}
          activeOpacity={0.8}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Text style={styles.sosIcon}>🚨</Text>
          )}

          <Text style={styles.sosText}>{getButtonText()}</Text>
        </TouchableOpacity>

        <View style={styles.statusBox}>
          <View
            style={[
              styles.statusDot,
              sosActivated && styles.activeDot,
              sending && styles.activeDot,
            ]}
          />

          <Text style={styles.statusText}>
            {sending
              ? "Preparing emergency alert"
              : sosActivated
              ? "Emergency alert recorded"
              : "Emergency mode ready"}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            🛡️ What happens during SOS?
          </Text>

          <Text style={styles.infoText}>
            • A 5-second cancellation countdown starts
          </Text>

          <Text style={styles.infoText}>
            • Your current location is collected
          </Text>

          <Text style={styles.infoText}>
            • Emergency SMS is prepared for trusted contacts
          </Text>

          <Text style={styles.infoText}>
            • The alert is saved in SOS history
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bottomButton}
        onPress={() => router.replace("/home")}
        disabled={sending}
      >
        <Text style={styles.bottomButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F7",
  },

  header: {
    height: 90,
    paddingTop: 35,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F3F3",
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

  historyButton: {
    width: 42,
    alignItems: "flex-end",
  },

  historyText: {
    color: "#6C3CE9",
    fontSize: 12,
    fontWeight: "700",
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 35,
  },

  question: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginTop: 10,
    maxWidth: 300,
    lineHeight: 20,
  },

  countdown: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#E53935",
    marginTop: 15,
  },

  sosButton: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#E53935",
    borderWidth: 14,
    borderColor: "#FFD4D4",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    elevation: 12,
    shadowColor: "#E53935",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  sosActivated: {
    backgroundColor: "#B71C1C",
  },

  sosDisabled: {
    opacity: 0.75,
  },

  sosIcon: {
    fontSize: 45,
  },

  sosText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 7,
    textAlign: "center",
  },

  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 25,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },

  activeDot: {
    backgroundColor: "#E53935",
  },

  statusText: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "600",
  },

  infoBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 18,
    marginTop: 20,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },

  infoText: {
    color: "#666666",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },

  bottomButton: {
    marginHorizontal: 20,
    marginBottom: 25,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#6C3CE9",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
