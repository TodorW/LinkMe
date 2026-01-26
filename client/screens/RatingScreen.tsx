import React, { useState } from "react";
import { View, StyleSheet, TextInput, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { StarRating } from "@/components/StarRating";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HelpRequest } from "@/types";
import { api } from "@/lib/api";
import * as Haptics from "expo-haptics";

interface RatingScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ Rating: { request: HelpRequest } }, "Rating">;
}

export default function RatingScreen({ navigation, route }: RatingScreenProps) {
  const { request } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isVolunteer = user?.role === "volunteer";
  const targetUserId = isVolunteer ? request.userId : request.volunteerId;
  const targetUserName = isVolunteer ? request.userName : request.volunteerName;

  const handleSubmit = async () => {
    if (rating === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!user || !targetUserId) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await api.ratings.create({
        fromUserId: user.id,
        toUserId: targetUserId,
        helpRequestId: request.id,
        score: rating,
        comment: comment.trim() || undefined,
      });

      await api.helpRequests.update(request.id, { status: "completed" });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.popToTop();
    } catch (error) {
      console.error("Neuspješno slanje ocene:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/default-avatar.png")}
            style={styles.avatar}
          />
          <ThemedText type="h3" style={styles.userName}>
            {targetUserName || "User"}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            {isVolunteer
              ? "Kako je bilo tvoje iskustvo pomažući?"
              : "Kakva je bila pomoć koju si dobio?"}
          </ThemedText>
        </View>

        <View
          style={[
            styles.ratingCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="body" style={styles.ratingLabel}>
            Ocijeni svoje iskustvo
          </ThemedText>
          <View style={styles.starsContainer}>
            <StarRating
              rating={rating}
              size={40}
              editable
              onRatingChange={setRating}
            />
          </View>
          <ThemedText
            type="small"
            style={[styles.ratingHint, { color: theme.textSecondary }]}
          >
            {rating === 0
              ? "Izaberi ocjenu"
              : rating <= 2
              ? "Žao nam je što tvoje iskustvo nije bilo najbolje."
              : rating <= 4
              ? "Hvala na tvojoj ocjeni!"
              : "Sjajno!"}
          </ThemedText>
        </View>

        <View style={styles.commentSection}>
          <ThemedText type="body" style={styles.commentLabel}>
            Ostavi komentar (opciono)
          </ThemedText>
          <View
            style={[
              styles.textAreaContainer,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.inputBorder,
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: theme.text }]}
              placeholder="Share your experience..."
              placeholderTextColor={theme.textDisabled}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
          </View>
          <ThemedText
            type="small"
            style={[styles.charCount, { color: theme.textSecondary }]}
          >
            {comment.length}/300
          </ThemedText>
        </View>

        <Button
          onPress={handleSubmit}
          disabled={rating === 0 || isLoading}
          style={styles.submitButton}
        >
          {isLoading ? "Submitting..." : "Submit Rating"}
        </Button>

        <ThemedText
          type="small"
          style={[styles.note, { color: theme.textSecondary }]}
        >
          Tvoja ocjena pomaže u izgradnji povjerenja u LinkMe zajednicu
        </ThemedText>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  ratingCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  ratingLabel: {
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  starsContainer: {
    marginBottom: Spacing.md,
  },
  ratingHint: {
    fontStyle: "italic",
  },
  commentSection: {
    marginBottom: Spacing.xl,
  },
  commentLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  textAreaContainer: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
  },
  textArea: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
  note: {
    textAlign: "center",
    fontStyle: "italic",
  },
});
