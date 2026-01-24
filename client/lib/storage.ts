import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { User, HelpRequest, Conversation, Message, Rating } from "@/types";
import { HelpCategoryId } from "@/constants/theme";

const STORAGE_KEYS = {
  USER: "@linkme_user",
  HELP_REQUESTS: "@linkme_help_requests",
  CONVERSATIONS: "@linkme_conversations",
  MESSAGES: "@linkme_messages",
  RATINGS: "@linkme_ratings",
  JMBG_HASHES: "@linkme_jmbg_hashes",
};

export async function hashJMBG(jmbg: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    jmbg
  );
  return hash;
}

export async function checkJMBGExists(jmbgHash: string): Promise<boolean> {
  try {
    const hashes = await AsyncStorage.getItem(STORAGE_KEYS.JMBG_HASHES);
    if (!hashes) return false;
    const hashArray: string[] = JSON.parse(hashes);
    return hashArray.includes(jmbgHash);
  } catch {
    return false;
  }
}

export async function addJMBGHash(jmbgHash: string): Promise<void> {
  try {
    const hashes = await AsyncStorage.getItem(STORAGE_KEYS.JMBG_HASHES);
    const hashArray: string[] = hashes ? JSON.parse(hashes) : [];
    if (!hashArray.includes(jmbgHash)) {
      hashArray.push(jmbgHash);
      await AsyncStorage.setItem(STORAGE_KEYS.JMBG_HASHES, JSON.stringify(hashArray));
    }
  } catch (error) {
    console.error("Failed to add JMBG hash:", error);
  }
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export async function updateUserRole(role: "user" | "volunteer"): Promise<User | null> {
  const user = await getUser();
  if (user) {
    user.role = role;
    await saveUser(user);
    return user;
  }
  return null;
}

export async function updateUserCategories(categories: HelpCategoryId[]): Promise<User | null> {
  const user = await getUser();
  if (user) {
    user.helpCategories = categories;
    await saveUser(user);
    return user;
  }
  return null;
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

export async function getHelpRequests(): Promise<HelpRequest[]> {
  try {
    const requests = await AsyncStorage.getItem(STORAGE_KEYS.HELP_REQUESTS);
    return requests ? JSON.parse(requests) : [];
  } catch {
    return [];
  }
}

export async function saveHelpRequest(request: HelpRequest): Promise<void> {
  const requests = await getHelpRequests();
  const index = requests.findIndex((r) => r.id === request.id);
  if (index >= 0) {
    requests[index] = request;
  } else {
    requests.push(request);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.HELP_REQUESTS, JSON.stringify(requests));
}

export async function deleteHelpRequest(id: string): Promise<void> {
  const requests = await getHelpRequests();
  const filtered = requests.filter((r) => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.HELP_REQUESTS, JSON.stringify(filtered));
}

export async function getConversations(): Promise<Conversation[]> {
  try {
    const convs = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return convs ? JSON.parse(convs) : [];
  } catch {
    return [];
  }
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  const conversations = await getConversations();
  const index = conversations.findIndex((c) => c.id === conversation.id);
  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.push(conversation);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const allMessages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = allMessages ? JSON.parse(allMessages) : [];
    return messages.filter((m) => m.conversationId === conversationId);
  } catch {
    return [];
  }
}

export async function saveMessage(message: Message): Promise<void> {
  try {
    const allMessages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = allMessages ? JSON.parse(allMessages) : [];
    messages.push(message);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save message:", error);
  }
}

export async function getRatings(userId: string): Promise<Rating[]> {
  try {
    const allRatings = await AsyncStorage.getItem(STORAGE_KEYS.RATINGS);
    const ratings: Rating[] = allRatings ? JSON.parse(allRatings) : [];
    return ratings.filter((r) => r.toUserId === userId);
  } catch {
    return [];
  }
}

export async function saveRating(rating: Rating): Promise<void> {
  try {
    const allRatings = await AsyncStorage.getItem(STORAGE_KEYS.RATINGS);
    const ratings: Rating[] = allRatings ? JSON.parse(allRatings) : [];
    ratings.push(rating);
    await AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
    
    const user = await getUser();
    if (user && user.id === rating.toUserId) {
      const userRatings = ratings.filter((r) => r.toUserId === user.id);
      const totalScore = userRatings.reduce((sum, r) => sum + r.score, 0);
      user.rating = totalScore / userRatings.length;
      user.ratingCount = userRatings.length;
      await saveUser(user);
    }
  } catch (error) {
    console.error("Failed to save rating:", error);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getAIMatchScore(
  request: HelpRequest,
  volunteerCategories: HelpCategoryId[],
  volunteerLocation?: { latitude: number; longitude: number }
): number {
  let score = 0;
  
  if (volunteerCategories.includes(request.category)) {
    score += 50;
  }
  
  const reqLat = request.latitude ?? request.location?.latitude;
  const reqLon = request.longitude ?? request.location?.longitude;
  
  if (volunteerLocation && reqLat !== undefined && reqLon !== undefined) {
    const distance = calculateDistance(
      reqLat,
      reqLon,
      volunteerLocation.latitude,
      volunteerLocation.longitude
    );
    if (distance < 1) score += 40;
    else if (distance < 5) score += 30;
    else if (distance < 10) score += 20;
    else score += 10;
  } else {
    score += 25;
  }
  
  if (request.urgency === "urgent") {
    score += 10;
  }
  
  return Math.min(score, 100);
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}
