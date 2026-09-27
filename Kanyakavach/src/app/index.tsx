import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logo}>🛡️</Text>
      </View>

      <Text style={styles.title}>KANYAKAVACH</Text>

      <Text style={styles.subtitle}>
        Your Safety. Your Shield.
      </Text>

      <ActivityIndicator
        size="large"
        color="#FFFFFF"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6C3CE9",
    justifyContent: "center",
    alignItems: "center",
  },

  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  logo: {
    fontSize: 60,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 3,
  },

  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 10,
  },

  loader: {
    marginTop: 35,
  },
});