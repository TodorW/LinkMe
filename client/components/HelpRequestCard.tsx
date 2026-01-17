import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { CategoryChip } from "@/components/CategoryChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, HelpCategories } from "@/constants/theme";
import { HelpRequest } from "@/types";
import * as Haptics from "expo-haptics";

interface HelpRequestCardProps {
  request: HelpRequest;
  onPress?: () => void;
  showAIScore?: boolean;
}

export function HelpRequestCard({
  request,
  onPress,
  showAIScore = false,
}: HelpRequestCardProps) {
  const { theme } = useTheme();
  const category = HelpCategories.find((c) => c.id === request.category);

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = () => {
    switch (request.status) {
      case "open":
        return theme.success;
      case "accepted":
        return theme.secondary;
      case "completed":
        return theme.textSecondary;
      case "cancelled":
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="user" size={20} color={theme.textSecondary} />
          </View>
          <View style={styles.userText}>
            <ThemedText type="body" style={styles.userName}>
              {request.userName}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary }}
            >
              {getTimeAgo(request.createdAt)}
            </ThemedText>
          </View>
        </View>
        {request.urgency === "urgent" ? (
          <View
            style={[styles.urgentBadge, { backgroundColor: theme.error }]}
          >
            <Feather name="alert-circle" size={12} color="#FFFFFF" />
            <ThemedText style={styles.urgentText}>Urgent</ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.categoryRow}>
        <CategoryChip categoryId={request.category} disabled />
        <View
          style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
        />
        <ThemedText
          type="small"
          style={[styles.statusText, { color: getStatusColor() }]}
        >
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </ThemedText>
      </View>

      <ThemedText
        type="body"
        numberOfLines={2}
        style={styles.description}
      >
        {request.description}
      </ThemedText>

      <View style={styles.footer}>
        <View style={styles.locationRow}>
          <Feather
            name="map-pin"
            size={14}
            color={theme.textSecondary}
          />
          <ThemedText
            type="small"
            style={[styles.locationText, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {request.location.address}
          </ThemedText>
        </View>
        {showAIScore && request.aiMatchScore !== undefined ? (
          <View
            style={[
              styles.aiScore,
              { backgroundColor: theme.secondary + "20" },
            ]}
          >
            <Feather name="zap" size={12} color={theme.secondary} />
            <ThemedText
              type="small"
              style={[styles.aiScoreText, { color: theme.secondary }]}
            >
              {request.aiMatchScore}% match
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userText: {
    marginLeft: Spacing.sm,
  },
  userName: {
    fontWeight: "600",
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  urgentText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  statusText: {
    marginLeft: Spacing.xs,
    fontWeight: "500",
  },
  description: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    marginLeft: Spacing.xs,
    flex: 1,
  },
  aiScore: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  aiScoreText: {
    marginLeft: 4,
    fontWeight: "600",
  },
});
