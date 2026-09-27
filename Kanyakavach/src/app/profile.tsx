import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getCurrentUser, signOut, type UserProfile } from "../lib/api";

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(() => {
    let active = true;
    setLoading(true);
    getCurrentUser()
      .then((profile) => { if (active) setUser(profile); })
      .catch((error) => {
        if (active) Alert.alert("Could not load profile", error instanceof Error ? error.message : "Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useFocusEffect(loadProfile);

  const handleSignOut = () => {
    Alert.alert("Sign out?", "You will need to log in again to view your account data.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => {
        await signOut();
        router.replace("/login");
      } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.back} />
      </View>
      {loading ? <ActivityIndicator style={styles.loader} size="large" color="#6C3CE9" /> : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.trim().charAt(0).toUpperCase() || "?"}</Text></View>
          <Text style={styles.name}>{user?.name || "Account"}</Text>
          <Text style={styles.caption}>Your Kanyakavach account</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account details</Text>
            <Text style={styles.label}>FULL NAME</Text>
            <Text style={styles.value}>{user?.name || "Not available"}</Text>
            <Text style={styles.label}>MOBILE NUMBER</Text>
            <Text style={styles.value}>{user?.phone || "Not available"}</Text>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{user?.email || "Not available"}</Text>
            <Text style={styles.label}>MEMBER SINCE</Text>
            <Text style={styles.value}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}</Text>
          </View>

          <Pressable style={styles.button} onPress={handleSignOut}><Text style={styles.buttonText}>Sign Out</Text></Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F7FC" },
  header: { height: 90, paddingTop: 35, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F1F1F1", justifyContent: "center", alignItems: "center" },
  backText: { fontSize: 34, color: "#333", marginTop: -4 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#222" },
  loader: { flex: 1 },
  content: { padding: 22, alignItems: "center" },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#EEE8FF", alignItems: "center", justifyContent: "center", marginTop: 18 },
  avatarText: { fontSize: 38, fontWeight: "bold", color: "#6C3CE9" },
  name: { color: "#222", fontSize: 24, fontWeight: "bold", marginTop: 14 },
  caption: { color: "#777", fontSize: 14, marginTop: 5, marginBottom: 22 },
  card: { width: "100%", backgroundColor: "#FFF", borderRadius: 16, padding: 18 },
  sectionTitle: { color: "#222", fontSize: 17, fontWeight: "bold", marginBottom: 12 },
  label: { color: "#888", fontSize: 11, fontWeight: "700", marginTop: 13 },
  value: { color: "#333", fontSize: 15, marginTop: 4 },
  button: { width: "100%", height: 52, borderRadius: 12, borderWidth: 1, borderColor: "#D33", alignItems: "center", justifyContent: "center", marginTop: 20 },
  buttonText: { color: "#C62828", fontSize: 15, fontWeight: "bold" },
});
