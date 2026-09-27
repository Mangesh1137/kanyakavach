import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import * as Location from "expo-location";

export default function LocationScreen() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    try {
      setLoading(true);

      // Location permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow location permission."
        );
        return;
      }

      // Get current location
      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(currentLocation);

      console.log(
        "Latitude:",
        currentLocation.coords.latitude
      );

      console.log(
        "Longitude:",
        currentLocation.coords.longitude
      );
    } catch (error) {
      console.log("Location Error:", error);

      Alert.alert(
        "Error",
        "Unable to get your location."
      );
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (!location) {
      Alert.alert(
        "Location Not Available",
        "First get your current location."
      );
      return;
    }

    const { latitude, longitude } = location.coords;

    const mapsUrl =
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.openURL(mapsUrl);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          📍 My Location
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>

        <Text style={styles.icon}>📍</Text>

        <Text style={styles.title}>
          Your Current Location
        </Text>

        <Text style={styles.subtitle}>
          Get your current GPS location
        </Text>

        {/* Get Location */}
        <Pressable
          style={styles.getButton}
          onPress={getLocation}
          disabled={loading}
        >
          <Text style={styles.getButtonText}>
            {loading
              ? "Getting Location..."
              : "Get My Location"}
          </Text>
        </Pressable>

        {/* Location Details */}
        {location && (
          <View style={styles.locationBox}>

            <Text style={styles.locationTitle}>
              Location Found ✅
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>
                Latitude
              </Text>

              <Text style={styles.value}>
                {location.coords.latitude.toFixed(7)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Longitude
              </Text>

              <Text style={styles.value}>
                {location.coords.longitude.toFixed(7)}
              </Text>
            </View>

            {/* Google Maps */}
            <Pressable
              style={styles.mapButton}
              onPress={openGoogleMaps}
            >
              <Text style={styles.mapButtonText}>
                🗺️ Open in Google Maps
              </Text>
            </Pressable>

          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F8",
  },

  header: {
    height: 65,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0DDE1",
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#8B1E3F",
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 45,
  },

  icon: {
    fontSize: 60,
    marginBottom: 15,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#8B1E3F",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#777",
    marginTop: 8,
    marginBottom: 30,
  },

  getButton: {
    width: "100%",
    backgroundColor: "#8B1E3F",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  getButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },

  locationBox: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  locationTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 18,
  },

  row: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    color: "#888",
    marginBottom: 3,
  },

  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },

  mapButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  mapButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
