import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, HelpCategories } from "@/constants/theme";
import { HelpCategoryId } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface CategoryChipProps {
  categoryId: HelpCategoryId;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function CategoryChip({
  categoryId,
  selected = false,
  onPress,
  disabled = false,
}: CategoryChipProps) {
  const { theme } = useTheme();
  const category = HelpCategories.find((c) => c.id === categoryId);

  if (!category) return null;

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundSecondary,
          borderColor: selected ? theme.primary : theme.border,
          opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <Feather
        name={category.icon as any}
        size={16}
        color={selected ? "#FFFFFF" : theme.text}
        style={styles.icon}
      />
      <ThemedText
        type="small"
        style={[
          styles.label,
          { color: selected ? "#FFFFFF" : theme.text },
        ]}
      >
        {category.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontWeight: "500",
  },
});
