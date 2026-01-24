import { HelpCategoryId } from "@/constants/theme";

export type UserRole = "user" | "volunteer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  jmbgHash: string;
  helpCategories: HelpCategoryId[];
  rating: number;
  ratingCount: number;
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  userId: string;
  userName: string;
  category: HelpCategoryId;
  description: string;
  urgency: "urgent" | "flexible";
  status: "open" | "accepted" | "completed" | "cancelled";
  latitude: number;
  longitude: number;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  volunteerId?: string;
  volunteerName?: string;
  createdAt: string;
  aiMatchScore?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant1Id?: string;
  participant1Name?: string;
  participant2Id?: string;
  participant2Name?: string;
  participants: {
    id: string;
    name: string;
  }[];
  lastMessage?: Message;
  helpRequestId?: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  helpRequestId: string;
  score: number;
  comment?: string;
  createdAt: string;
}
