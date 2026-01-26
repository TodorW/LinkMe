import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { CategoryChip } from "@/components/CategoryChip";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HelpRequest } from "@/types";
import { api } from "@/lib/api";
import * as Haptics from "expo-haptics";

interface HelpDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ HelpDetail: { request: HelpRequest } }, "HelpDetail">;
}

export default function HelpDetailScreen({
  navigation,
  route,
}: HelpDetailScreenProps) {
  const { request } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const isOwner = user?.id === request.userId;
  const isVolunteer = user?.role === "volunteer";

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Upravo sada";
    if (diffMins < 60) return `Prije ${diffMins} minuta`;
    if (diffHours < 24) return `Prije ${diffHours} sati`;
    return `Prije ${diffDays} dana`;
  };

  const handleOfferHelp = async () => {
    if (!user) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await api.helpRequests.update(request.id, {
        status: "accepted",
        volunteerId: user.id,
        volunteerName: user.name,
      });

      const conversation = await api.conversations.create({
        participant1Id: request.userId,
        participant1Name: request.userName,
        participant2Id: user.id,
        participant2Name: user.name,
        helpRequestId: request.id,
      });

      await api.messages.create(conversation.id, {
        senderId: user.id,
        senderName: user.name,
        text: `Pozdrav! Htio/Htjela bih Vam pomoći sa Vašim zahtjevom: "${request.description.substring(0, 50)}..."`,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const conversationWithParticipants = {
        ...conversation,
        participants: [
          { id: request.userId, name: request.userName },
          { id: user.id, name: user.name },
        ],
      };
      
      navigation.navigate("MessagesTab", {
        screen: "Chat",
        params: { conversation: conversationWithParticipants },
      });
    } catch (error) {
      console.error("Neuspješno ponuđena pomoć:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    Alert.alert(
      "Otkaži Zahtjev",
      "Jeste li sigurni da želite otkazati ovaj zahtjev za pomoć?",
      [
        { text: "Ne", style: "cancel" },
        {
          text: "Da, Otkaži",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            try {
              await api.helpRequests.update(request.id, { status: "cancelled" });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            } catch (error) {
              console.error("Neuspješno otkazivanje zahtjeva:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
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

  const address = request.address || (request as any).location?.address || "Nepoznata lokacija";

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={require("../../assets/images/default-avatar.png")}
              style={styles.avatar}
            />
            <View style={styles.userText}>
              <ThemedText type="h3">{request.userName}</ThemedText>
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
              <Feather name="alert-circle" size={14} color="#FFFFFF" />
              <ThemedText style={styles.urgentText}>Urgent</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.categoryRow}>
          <CategoryChip categoryId={request.category} disabled />
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor() + "20" }]}
          >
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
        </View>

        <View
          style={[
            styles.descriptionCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="body">{request.description}</ThemedText>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={18} color={theme.primary} />
            <ThemedText type="body" style={styles.infoText}>
              {address}
            </ThemedText>
          </View>
        </View>

        {isVolunteer && request.aiMatchScore !== undefined ? (
          <View
            style={[
              styles.aiMatchCard,
              { backgroundColor: theme.secondary + "15" },
            ]}
          >
            <View style={styles.aiMatchHeader}>
              <Feather name="zap" size={20} color={theme.secondary} />
              <ThemedText type="h4" style={{ color: theme.secondary, marginLeft: Spacing.sm }}>
                AI Match: {request.aiMatchScore}%
              </ThemedText>
            </View>
            <ThemedText
              type="small"
              style={[styles.aiMatchText, { color: theme.secondary }]}
            >
              Na osnovu Vaših vještina i lokacije, Vi ste odličan kandidat za pomoć sa ovim zahtjevom!
            </ThemedText>
          </View>
        ) : null}

        {request.volunteerId && request.volunteerName ? (
          <View
            style={[
              styles.volunteerCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="user-check" size={20} color={theme.secondary} />
            <View style={styles.volunteerInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Volonter zadužen
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {request.volunteerName}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.lg,
            borderTopColor: theme.border,
          },
        ]}
      >
        {isOwner && request.status === "open" ? (
          <Pressable
            onPress={handleCancelRequest}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.cancelButton,
              { opacity: pressed || isLoading ? 0.7 : 1 },
            ]}
          >
            <ThemedText style={{ color: theme.error, fontWeight: "600" }}>
              Otkaži Zahtjev
            </ThemedText>
          </Pressable>
        ) : null}

        {isVolunteer && request.status === "open" ? (
          <Button
            onPress={handleOfferHelp}
            disabled={isLoading}
            style={styles.helpButton}
          >
            {isLoading ? "Povezivanje..." : "Ponudi pomoć"}
          </Button>
        ) : null}

        {request.status === "accepted" && !isOwner ? (
          <Button
            onPress={() => navigation.navigate("Rating", { request })}
            style={styles.helpButton}
          >
            Označi kao završeno
          </Button>
        ) : null}
      </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userText: {
    marginLeft: Spacing.md,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  urgentText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontWeight: "600",
  },
  descriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  infoSection: {
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  infoText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  aiMatchCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  aiMatchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  aiMatchText: {
    fontWeight: "500",
  },
  volunteerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  volunteerInfo: {
    marginLeft: Spacing.md,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
  },
  helpButton: {
    flex: 1,
  },
});
