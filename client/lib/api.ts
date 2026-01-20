import { getApiUrl } from "./query-client";
import { User, HelpRequest, Conversation, Message, Rating } from "@/types";
import { HelpCategoryId } from "@/constants/theme";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const baseUrl = getApiUrl();
  const url = new URL(path, baseUrl);

  const res = await fetch(url.toString(), {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: {
      email: string;
      password: string;
      name: string;
      jmbgHash: string;
      role: "user" | "volunteer";
      helpCategories: HelpCategoryId[];
    }) => request<User>("POST", "/api/auth/register", data),

    login: (email: string, password: string) =>
      request<User>("POST", "/api/auth/login", { email, password }),
  },

  users: {
    get: (id: string) => request<User>("GET", `/api/users/${id}`),

    update: (id: string, data: Partial<User>) =>
      request<User>("PUT", `/api/users/${id}`, data),
  },

  helpRequests: {
    list: (params?: { userId?: string; status?: string }) => {
      let path = "/api/help-requests";
      if (params) {
        const query = new URLSearchParams();
        if (params.userId) query.set("userId", params.userId);
        if (params.status) query.set("status", params.status);
        const queryStr = query.toString();
        if (queryStr) path += `?${queryStr}`;
      }
      return request<HelpRequest[]>("GET", path);
    },

    get: (id: string) => request<HelpRequest>("GET", `/api/help-requests/${id}`),

    create: (data: {
      userId: string;
      userName: string;
      category: HelpCategoryId;
      description: string;
      urgency: "urgent" | "flexible";
      latitude: number;
      longitude: number;
      address: string;
    }) => request<HelpRequest>("POST", "/api/help-requests", data),

    update: (id: string, data: Partial<HelpRequest>) =>
      request<HelpRequest>("PUT", `/api/help-requests/${id}`, data),
  },

  conversations: {
    list: (userId: string) =>
      request<(Conversation & { lastMessage?: Message })[]>(
        "GET",
        `/api/conversations?userId=${userId}`
      ),

    get: (id: string) => request<Conversation>("GET", `/api/conversations/${id}`),

    create: (data: {
      participant1Id: string;
      participant1Name: string;
      participant2Id: string;
      participant2Name: string;
      helpRequestId?: string;
    }) => request<Conversation>("POST", "/api/conversations", data),
  },

  messages: {
    list: (conversationId: string) =>
      request<Message[]>("GET", `/api/conversations/${conversationId}/messages`),

    create: (conversationId: string, data: { senderId: string; senderName: string; text: string }) =>
      request<Message>("POST", `/api/conversations/${conversationId}/messages`, data),

    markAsRead: (conversationId: string, userId: string) =>
      request<{ success: boolean }>(
        "PUT",
        `/api/conversations/${conversationId}/messages/read`,
        { userId }
      ),
  },

  ratings: {
    create: (data: {
      fromUserId: string;
      toUserId: string;
      helpRequestId: string;
      score: number;
      comment?: string;
    }) => request<Rating>("POST", "/api/ratings", data),

    check: (helpRequestId: string, fromUserId: string) =>
      request<{ hasRated: boolean; rating?: Rating }>(
        "GET",
        `/api/ratings/check?helpRequestId=${helpRequestId}&fromUserId=${fromUserId}`
      ),
  },
};
