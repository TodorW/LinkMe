import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { UserRole } from "@/types";

interface RoleBadgeProps {
  role: UserRole;
  size?: "small" | "medium" | "large";
}

export function RoleBadge({ role, size = "medium" }: RoleBadgeProps) {
  const { theme } = useTheme();
  
  const isVolunteer = role === "volunteer";
  const backgroundColor = isVolunteer ? theme.roleVolunteer : theme.roleUser;
  const label = isVolunteer ? "Volunteering" : "Seeking Help";
  const icon = isVolunteer ? "heart" : "help-circle";

  const sizeStyles = {
    small: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, iconSize: 12, fontSize: 12 },
    medium: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, iconSize: 14, fontSize: 14 },
    large: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, iconSize: 16, fontSize: 16 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
      ]}
    >
      <Feather
        name={icon}
        size={currentSize.iconSize}
        color="#FFFFFF"
        style={styles.icon}
      />
      <ThemedText
        style={[
          styles.text,
          { fontSize: currentSize.fontSize },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
