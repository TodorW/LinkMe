import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["user", "volunteer"]);
export const urgencyEnum = pgEnum("urgency", ["urgent", "flexible"]);
export const requestStatusEnum = pgEnum("request_status", ["open", "accepted", "completed", "cancelled"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  jmbgHash: text("jmbg_hash").notNull().unique(),
  helpCategories: text("help_categories").array().notNull().default(sql`ARRAY[]::text[]`),
  rating: real("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  helpRequestsAsUser: many(helpRequests, { relationName: "userRequests" }),
  helpRequestsAsVolunteer: many(helpRequests, { relationName: "volunteerRequests" }),
  sentMessages: many(messages),
  ratingsGiven: many(ratings, { relationName: "ratingsGiven" }),
  ratingsReceived: many(ratings, { relationName: "ratingsReceived" }),
}));

export const helpRequests = pgTable("help_requests", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  userName: text("user_name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  urgency: urgencyEnum("urgency").notNull().default("flexible"),
  status: requestStatusEnum("status").notNull().default("open"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull(),
  volunteerId: varchar("volunteer_id", { length: 36 }).references(() => users.id),
  volunteerName: text("volunteer_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const helpRequestsRelations = relations(helpRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [helpRequests.userId],
    references: [users.id],
    relationName: "userRequests",
  }),
  volunteer: one(users, {
    fields: [helpRequests.volunteerId],
    references: [users.id],
    relationName: "volunteerRequests",
  }),
  conversations: many(conversations),
  ratings: many(ratings),
}));

export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  helpRequestId: varchar("help_request_id", { length: 36 }).references(() => helpRequests.id),
  participant1Id: varchar("participant1_id", { length: 36 }).notNull().references(() => users.id),
  participant1Name: text("participant1_name").notNull(),
  participant2Id: varchar("participant2_id", { length: 36 }).notNull().references(() => users.id),
  participant2Name: text("participant2_name").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  helpRequest: one(helpRequests, {
    fields: [conversations.helpRequestId],
    references: [helpRequests.id],
  }),
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => conversations.id),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
  senderName: text("sender_name").notNull(),
  text: text("text").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const ratings = pgTable("ratings", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id", { length: 36 }).notNull().references(() => users.id),
  toUserId: varchar("to_user_id", { length: 36 }).notNull().references(() => users.id),
  helpRequestId: varchar("help_request_id", { length: 36 }).notNull().references(() => helpRequests.id),
  score: integer("score").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ratingsRelations = relations(ratings, ({ one }) => ({
  fromUser: one(users, {
    fields: [ratings.fromUserId],
    references: [users.id],
    relationName: "ratingsGiven",
  }),
  toUser: one(users, {
    fields: [ratings.toUserId],
    references: [users.id],
    relationName: "ratingsReceived",
  }),
  helpRequest: one(helpRequests, {
    fields: [ratings.helpRequestId],
    references: [helpRequests.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  rating: true,
  ratingCount: true,
  createdAt: true,
});

export const insertHelpRequestSchema = createInsertSchema(helpRequests).omit({
  id: true,
  volunteerId: true,
  volunteerName: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type HelpRequest = typeof helpRequests.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;
