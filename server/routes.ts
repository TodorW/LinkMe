import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name, role, jmbgHash, helpCategories } = req.body;

      if (!email || !password || !name || !role || !jmbgHash) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingJmbg = await storage.getUserByJmbgHash(jmbgHash);
      if (existingJmbg) {
        return res.status(400).json({ error: "JMBG already registered" });
      }

      const user = await storage.createUser({
        email,
        password: hashPassword(password),
        name,
        role,
        jmbgHash,
        helpCategories: helpCategories || [],
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { role, helpCategories, name } = req.body;
      const updateData: any = {};
      
      if (role) updateData.role = role;
      if (helpCategories) updateData.helpCategories = helpCategories;
      if (name) updateData.name = name;

      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Help Request routes
  app.get("/api/help-requests", async (req: Request, res: Response) => {
    try {
      const { userId, status } = req.query;
      
      if (userId) {
        const requests = await storage.getHelpRequestsByUser(userId as string);
        return res.json(requests);
      }
      
      if (status === "open") {
        const requests = await storage.getOpenHelpRequests();
        return res.json(requests);
      }

      const requests = await storage.getOpenHelpRequests();
      res.json(requests);
    } catch (error) {
      console.error("Get help requests error:", error);
      res.status(500).json({ error: "Failed to get help requests" });
    }
  });

  app.get("/api/help-requests/:id", async (req: Request, res: Response) => {
    try {
      const request = await storage.getHelpRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Help request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Get help request error:", error);
      res.status(500).json({ error: "Failed to get help request" });
    }
  });

  app.post("/api/help-requests", async (req: Request, res: Response) => {
    try {
      const { userId, userName, category, description, urgency, latitude, longitude, address } = req.body;

      if (!userId || !userName || !category || !description || !latitude || !longitude || !address) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const request = await storage.createHelpRequest({
        userId,
        userName,
        category,
        description,
        urgency: urgency || "flexible",
        status: "open",
        latitude,
        longitude,
        address,
      });

      res.status(201).json(request);
    } catch (error) {
      console.error("Create help request error:", error);
      res.status(500).json({ error: "Failed to create help request" });
    }
  });

  app.put("/api/help-requests/:id", async (req: Request, res: Response) => {
    try {
      const { status, volunteerId, volunteerName } = req.body;
      const updateData: any = {};
      
      if (status) updateData.status = status;
      if (volunteerId) updateData.volunteerId = volunteerId;
      if (volunteerName) updateData.volunteerName = volunteerName;

      const request = await storage.updateHelpRequest(req.params.id, updateData);
      if (!request) {
        return res.status(404).json({ error: "Help request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Update help request error:", error);
      res.status(500).json({ error: "Failed to update help request" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      const conversations = await storage.getConversationsByUser(userId as string);
      
      const conversationsWithLastMessage = await Promise.all(
        conversations.map(async (conv) => {
          const messages = await storage.getMessagesByConversation(conv.id);
          const lastMessage = messages[messages.length - 1];
          return { ...conv, lastMessage };
        })
      );
      
      res.json(conversationsWithLastMessage);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ error: "Failed to get conversation" });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { participant1Id, participant1Name, participant2Id, participant2Name, helpRequestId } = req.body;

      if (!participant1Id || !participant1Name || !participant2Id || !participant2Name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await storage.getConversationByParticipants(participant1Id, participant2Id);
      if (existing) {
        return res.json(existing);
      }

      const conversation = await storage.createConversation({
        participant1Id,
        participant1Name,
        participant2Id,
        participant2Name,
        helpRequestId,
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Message routes
  app.get("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    try {
      const { senderId, senderName, text } = req.body;
      const { conversationId } = req.params;

      if (!senderId || !senderName || !text) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const message = await storage.createMessage({
        conversationId,
        senderId,
        senderName,
        text,
      });

      await storage.updateConversation(conversationId, { updatedAt: new Date() });

      res.status(201).json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.put("/api/conversations/:conversationId/messages/read", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      await storage.markMessagesAsRead(req.params.conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark messages read error:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  // Rating routes
  app.post("/api/ratings", async (req: Request, res: Response) => {
    try {
      const { fromUserId, toUserId, helpRequestId, score, comment } = req.body;

      if (!fromUserId || !toUserId || !helpRequestId || score === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await storage.getRatingByRequestAndUser(helpRequestId, fromUserId);
      if (existing) {
        return res.status(400).json({ error: "Already rated this request" });
      }

      const rating = await storage.createRating({
        fromUserId,
        toUserId,
        helpRequestId,
        score,
        comment,
      });

      const toUser = await storage.getUser(toUserId);
      if (toUser) {
        const newRatingCount = toUser.ratingCount + 1;
        const newRating = ((toUser.rating * toUser.ratingCount) + score) / newRatingCount;
        await storage.updateUser(toUserId, { rating: newRating, ratingCount: newRatingCount });
      }

      res.status(201).json(rating);
    } catch (error) {
      console.error("Create rating error:", error);
      res.status(500).json({ error: "Failed to create rating" });
    }
  });

  app.get("/api/ratings/check", async (req: Request, res: Response) => {
    try {
      const { helpRequestId, fromUserId } = req.query;
      if (!helpRequestId || !fromUserId) {
        return res.status(400).json({ error: "helpRequestId and fromUserId required" });
      }
      const rating = await storage.getRatingByRequestAndUser(helpRequestId as string, fromUserId as string);
      res.json({ hasRated: !!rating, rating });
    } catch (error) {
      console.error("Check rating error:", error);
      res.status(500).json({ error: "Failed to check rating" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
