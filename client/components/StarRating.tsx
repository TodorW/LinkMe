import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 24,
  editable = false,
  onRatingChange,
}: StarRatingProps) {
  const { theme } = useTheme();

  const handlePress = (star: number) => {
    if (editable && onRatingChange) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRatingChange(star);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starNumber = i + 1;
        const filled = starNumber <= rating;

        return (
          <Pressable
            key={i}
            onPress={() => handlePress(starNumber)}
            disabled={!editable}
            style={({ pressed }) => [
              styles.star,
              { opacity: pressed && editable ? 0.7 : 1 },
            ]}
          >
            <Feather
              name={filled ? "star" : "star"}
              size={size}
              color={filled ? "#FFB800" : theme.textDisabled}
              style={{
                ...(filled && {
                  textShadowColor: "#FFB80040",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                }),
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginHorizontal: Spacing.xs / 2,
  },
});
