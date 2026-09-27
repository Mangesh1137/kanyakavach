import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { addContact as createContact, deleteContact as removeContact, getContacts, setPrimaryContact, type Contact } from "../lib/api";

const MAX_CONTACTS = 5;

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setContacts(await getContacts());
    } catch (error) {
      console.log("Load contacts error:", error);
      Alert.alert("Unable to load contacts", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setRelation("");
    setShowForm(false);
  };

  const addContact = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanRelation = relation.trim();

    if (!cleanName || !cleanPhone || !cleanRelation) {
      Alert.alert("Missing Information", "Please fill all fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (contacts.length >= MAX_CONTACTS) {
      Alert.alert(
        "Contact Limit Reached",
        `You can add up to ${MAX_CONTACTS} emergency contacts.`
      );
      return;
    }

    const alreadyExists = contacts.some(
      (contact) => contact.phone === cleanPhone
    );

    if (alreadyExists) {
      Alert.alert(
        "Already Added",
        "This mobile number is already in your contacts."
      );
      return;
    }

    setSaving(true);

    try {
      const newContact = await createContact({ name: cleanName, phone: cleanPhone, relation: cleanRelation });
      setContacts((current) => [...current, newContact]);
      resetForm();
      Alert.alert("Success", "Emergency contact added successfully.");
    } catch (error) {
      Alert.alert("Unable to add contact", error instanceof Error ? error.message : "Please try again.");
    } finally { setSaving(false); }
  };

  const deleteContact = (id: number) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (saving) return;

            setSaving(true);

            try { await removeContact(id); setContacts(await getContacts()); }
            catch (error) { Alert.alert("Unable to delete contact", error instanceof Error ? error.message : "Please try again."); }
            finally { setSaving(false); }
          },
        },
      ]
    );
  };

  const makePrimary = async (id: number) => {
    if (saving) return;

    setSaving(true);

    try { await setPrimaryContact(id); setContacts(await getContacts()); Alert.alert("Primary Contact", "Primary emergency contact updated."); }
    catch (error) { Alert.alert("Unable to update contact", error instanceof Error ? error.message : "Please try again."); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C3CE9" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Emergency Contacts</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🛡️</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Stay Connected</Text>

            <Text style={styles.infoText}>
              Add trusted people who can help you during an emergency.
            </Text>
          </View>
        </View>

        {!showForm && (
          <TouchableOpacity
            style={[
              styles.addButton,
              contacts.length >= MAX_CONTACTS && styles.disabledButton,
            ]}
            onPress={() => setShowForm(true)}
            disabled={contacts.length >= MAX_CONTACTS || saving}
          >
            <Text style={styles.addIcon}>＋</Text>
            <Text style={styles.addButtonText}>
              Add Emergency Contact
            </Text>
          </TouchableOpacity>
        )}

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Emergency Contact</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              editable={!saving}
            />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              editable={!saving}
              onChangeText={(text) =>
                setPhone(text.replace(/[^0-9]/g, ""))
              }
            />

            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mother, Father, Friend"
              placeholderTextColor="#999"
              value={relation}
              onChangeText={setRelation}
              editable={!saving}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving && styles.disabledButton,
                ]}
                onPress={addContact}
                disabled={saving}
              >
                <Text style={styles.saveText}>
                  {saving ? "Saving..." : "Save Contact"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          My Emergency Contacts ({contacts.length}/{MAX_CONTACTS})
        </Text>

        {contacts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No contacts added</Text>
            <Text style={styles.emptyText}>
              Add at least one trusted contact for emergencies.
            </Text>
          </View>
        ) : (
          contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.contactName}>{contact.name}</Text>

                  {contact.primary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryText}>PRIMARY</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.relation}>{contact.relation}</Text>
                <Text style={styles.phone}>📞 {contact.phone}</Text>

                {!contact.primary && (
                  <TouchableOpacity
                    onPress={() => makePrimary(contact.id)}
                    disabled={saving}
                  >
                    <Text style={styles.primaryLink}>
                      Make Primary
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteContact(contact.id)}
                disabled={saving}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>⚠️ Important</Text>
          <Text style={styles.noteText}>
            Make sure your emergency contacts know that they have been
            added to Kanyakavach.
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F7FC",
  },

  loadingText: {
    fontSize: 16,
    color: "#6C3CE9",
    fontWeight: "600",
    marginTop: 12,
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
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 34,
    color: "#333",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
  },

  headerSpace: {
    width: 42,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EEE8FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  infoIcon: {
    fontSize: 30,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5530B8",
  },

  infoText: {
    color: "#6D5A99",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },

  addButton: {
    height: 55,
    backgroundColor: "#6C3CE9",
    borderRadius: 13,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  addIcon: {
    color: "#FFFFFF",
    fontSize: 25,
    marginRight: 8,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#FAFAFA",
  },

  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  cancelButton: {
    width: "46%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: "#555",
    fontWeight: "600",
  },

  saveButton: {
    width: "46%",
    height: 48,
    borderRadius: 10,
    backgroundColor: "#6C3CE9",
    justifyContent: "center",
    alignItems: "center",
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
    marginTop: 25,
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EDE5FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#6C3CE9",
    fontSize: 20,
    fontWeight: "bold",
  },

  contactInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },

  primaryBadge: {
    backgroundColor: "#E8F8EF",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 7,
  },

  primaryText: {
    color: "#2E8B57",
    fontSize: 8,
    fontWeight: "bold",
  },

  relation: {
    color: "#777",
    fontSize: 12,
    marginTop: 3,
  },

  phone: {
    color: "#555",
    fontSize: 12,
    marginTop: 5,
  },

  primaryLink: {
    color: "#6C3CE9",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 6,
  },

  deleteButton: {
    padding: 8,
  },

  deleteIcon: {
    fontSize: 18,
  },

  noteCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 14,
    padding: 15,
    marginTop: 20,
  },

  noteTitle: {
    color: "#8A5A00",
    fontWeight: "bold",
    fontSize: 14,
  },

  noteText: {
    color: "#8A6B32",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },
});
