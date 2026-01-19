import {
  users,
  helpRequests,
  conversations,
  messages,
  ratings,
  type User,
  type InsertUser,
  type HelpRequest,
  type InsertHelpRequest,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Rating,
  type InsertRating,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByJmbgHash(jmbgHash: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  // Help Requests
  getHelpRequest(id: string): Promise<HelpRequest | undefined>;
  getHelpRequestsByUser(userId: string): Promise<HelpRequest[]>;
  getOpenHelpRequests(): Promise<HelpRequest[]>;
  createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest>;
  updateHelpRequest(id: string, data: Partial<HelpRequest>): Promise<HelpRequest | undefined>;
  
  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationByParticipants(userId1: string, userId2: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | undefined>;
  
  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  
  // Ratings
  getRating(id: string): Promise<Rating | undefined>;
  getRatingByRequestAndUser(helpRequestId: string, fromUserId: string): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByJmbgHash(jmbgHash: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.jmbgHash, jmbgHash));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Help Requests
  async getHelpRequest(id: string): Promise<HelpRequest | undefined> {
    const [request] = await db.select().from(helpRequests).where(eq(helpRequests.id, id));
    return request || undefined;
  }

  async getHelpRequestsByUser(userId: string): Promise<HelpRequest[]> {
    return db.select().from(helpRequests).where(eq(helpRequests.userId, userId)).orderBy(desc(helpRequests.createdAt));
  }

  async getOpenHelpRequests(): Promise<HelpRequest[]> {
    return db.select().from(helpRequests).where(eq(helpRequests.status, "open")).orderBy(desc(helpRequests.createdAt));
  }

  async createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest> {
    const [helpRequest] = await db.insert(helpRequests).values(request).returning();
    return helpRequest;
  }

  async updateHelpRequest(id: string, data: Partial<HelpRequest>): Promise<HelpRequest | undefined> {
    const [request] = await db.update(helpRequests).set(data).where(eq(helpRequests.id, id)).returning();
    return request || undefined;
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationByParticipants(userId1: string, userId2: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(
      or(
        and(eq(conversations.participant1Id, userId1), eq(conversations.participant2Id, userId2)),
        and(eq(conversations.participant1Id, userId2), eq(conversations.participant2Id, userId1))
      )
    );
    return conversation || undefined;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return db.select().from(conversations).where(
      or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId))
    ).orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [conv] = await db.insert(conversations).values(conversation).returning();
    return conv;
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db.update(conversations).set(data).where(eq(conversations.id, id)).returning();
    return conversation || undefined;
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db.update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.senderId, userId)
        )
      );
  }

  // Ratings
  async getRating(id: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating || undefined;
  }

  async getRatingByRequestAndUser(helpRequestId: string, fromUserId: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(
      and(eq(ratings.helpRequestId, helpRequestId), eq(ratings.fromUserId, fromUserId))
    );
    return rating || undefined;
  }

  async createRating(rating: InsertRating): Promise<Rating> {
    const [r] = await db.insert(ratings).values(rating).returning();
    return r;
  }
}

export const storage = new DatabaseStorage();
