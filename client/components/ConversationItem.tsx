import React from "react";
import { View, Pressable, StyleSheet, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Conversation } from "@/types";
import * as Haptics from "expo-haptics";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress?: () => void;
}

export function ConversationItem({
  conversation,
  currentUserId,
  onPress,
}: ConversationItemProps) {
  const { theme } = useTheme();
  
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId
  );
  
  const hasUnread = conversation.lastMessage && !conversation.lastMessage.read && 
    conversation.lastMessage.senderId !== currentUserId;

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? theme.backgroundSecondary
            : theme.backgroundDefault,
        },
      ]}
    >
      <Image
        source={require("../../assets/images/default-avatar.png")}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText
            type="body"
            style={[styles.name, hasUnread && styles.unreadName]}
            numberOfLines={1}
          >
            {otherParticipant?.name || "Unknown"}
          </ThemedText>
          {conversation.lastMessage ? (
            <ThemedText
              type="small"
              style={{ color: hasUnread ? theme.primary : theme.textSecondary }}
            >
              {formatTime(conversation.lastMessage.createdAt)}
            </ThemedText>
          ) : null}
        </View>
        {conversation.lastMessage ? (
          <View style={styles.messageRow}>
            <ThemedText
              type="small"
              numberOfLines={1}
              style={[
                styles.lastMessage,
                {
                  color: hasUnread ? theme.text : theme.textSecondary,
                  fontWeight: hasUnread ? "600" : "400",
                },
              ]}
            >
              {conversation.lastMessage.text}
            </ThemedText>
            {hasUnread ? (
              <View
                style={[styles.unreadDot, { backgroundColor: theme.primary }]}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  name: {
    fontWeight: "600",
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadName: {
    fontWeight: "700",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: Spacing.sm,
  },
});
