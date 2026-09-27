import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === "web" ? "http://localhost:3000" : "http://YOUR_COMPUTER_LAN_IP:3000");
const TOKEN_KEY = "kanyakavach_auth_token";

export type UserProfile = { id: number; name: string; phone: string; email: string; createdAt: string };
export type Contact = { id: number; name: string; phone: string; relation: string; primary: boolean };
export type SOSHistory = { id: string | number; date: string; latitude: number; longitude: number; contactsCount: number; status: "sent" | "cancelled" | "prepared" };
export type SafetyTrip = { id: number; start: string; destination: string; expectedTime: string; startedAt: string };

async function request<T>(path: string, options: { method?: string; body?: string } = {}): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error(`Cannot reach the server at ${API_URL}. Check that the backend is running and both devices are on the same Wi-Fi.`);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body as T;
}

export async function authenticate(path: "/auth/register" | "/auth/login", data: Record<string, string>) {
  const result = await request<{ token: string; user: { id: number; name: string; phone: string; email: string } }>(path, { method: "POST", body: JSON.stringify(data) });
  await AsyncStorage.setItem(TOKEN_KEY, result.token);
  return result.user;
}

export const getCurrentUser = () => request<UserProfile>("/auth/me");
export const signOut = () => AsyncStorage.removeItem(TOKEN_KEY);

export const getContacts = () => request<Contact[]>("/contacts");
export const addContact = (contact: Omit<Contact, "id" | "primary">) => request<Contact>("/contacts", { method: "POST", body: JSON.stringify(contact) });
export const deleteContact = (id: number) => request<{ ok: boolean }>(`/contacts/${id}`, { method: "DELETE" });
export const setPrimaryContact = (id: number) => request<{ ok: boolean }>(`/contacts/${id}/primary`, { method: "PATCH" });
export const saveSosEvent = (event: Omit<SOSHistory, "id" | "date">) => request<{ id: number }>("/sos-events", { method: "POST", body: JSON.stringify(event) });
export const getSosHistory = () => request<SOSHistory[]>("/sos-events");
export const getActiveTrip = () => request<SafetyTrip | null>("/trips/active");
export const startSafetyTrip = (trip: Omit<SafetyTrip, "id" | "startedAt">) => request<SafetyTrip>("/trips", { method: "POST", body: JSON.stringify(trip) });
export const endSafetyTrip = (id: number) => request<{ ok: boolean }>(`/trips/${id}/end`, { method: "PATCH" });
