import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RoleBadge } from "@/components/RoleBadge";
import { HelpRequestCard } from "@/components/HelpRequestCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, HelpCategories, HelpCategoryId } from "@/constants/theme";
import { HelpRequest } from "@/types";
import { getHelpRequests, getAIMatchScore } from "@/lib/storage";
import * as Haptics from "expo-haptics";

interface MapScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategoryId | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const isVolunteer = user?.role === "volunteer";

  const loadRequests = useCallback(async () => {
    try {
      const allRequests = await getHelpRequests();
      let filteredRequests = allRequests.filter((r) => r.status === "open");

      if (isVolunteer && user) {
        filteredRequests = filteredRequests
          .filter((r) => r.userId !== user.id)
          .map((r) => ({
            ...r,
            aiMatchScore: getAIMatchScore(r, user.helpCategories),
          }))
          .sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
      } else if (user) {
        filteredRequests = filteredRequests.filter((r) => r.userId === user.id);
      }

      if (selectedCategory) {
        filteredRequests = filteredRequests.filter(
          (r) => r.category === selectedCategory
        );
      }

      setRequests(filteredRequests);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [isVolunteer, user, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadRequests();
  }, [loadRequests]);

  const handleRequestPress = (request: HelpRequest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("HelpDetail", { request });
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.sectionHeader}>
        <ThemedText type="h3">
          {isVolunteer ? "People Need Help" : "Your Requests"}
        </ThemedText>
        {isVolunteer ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilters(!showFilters);
            }}
            style={[
              styles.filterButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="sliders" size={18} color={theme.text} />
          </Pressable>
        ) : null}
      </View>

      {isVolunteer && showFilters ? (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: null, label: "All" }, ...HelpCategories]}
            keyExtractor={(item) => item.id || "all"}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(item.id as HelpCategoryId | null);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedCategory === item.id
                        ? theme.primary
                        : theme.backgroundSecondary,
                    borderColor:
                      selectedCategory === item.id
                        ? theme.primary
                        : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color:
                      selectedCategory === item.id ? "#FFFFFF" : theme.text,
                    fontWeight: "500",
                  }}
                >
                  {item.label}
                </ThemedText>
              </Pressable>
            )}
          />
        </View>
      ) : null}

      {isVolunteer && requests.length > 0 ? (
        <View
          style={[
            styles.aiTip,
            { backgroundColor: theme.secondary + "15" },
          ]}
        >
          <Feather name="zap" size={16} color={theme.secondary} />
          <ThemedText
            type="small"
            style={[styles.aiTipText, { color: theme.secondary }]}
          >
            AI matched based on your skills and location
          </ThemedText>
        </View>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-map.png")}
      title={isVolunteer ? "No requests nearby" : "No active requests"}
      description={
        isVolunteer
          ? "Check back later or expand your search radius"
          : "Tap the button below to create a new help request"
      }
      actionLabel={!isVolunteer ? "Request Help" : undefined}
      onAction={!isVolunteer ? () => navigation.navigate("RequestHelp") : undefined}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + (isVolunteer ? Spacing.xl : 100),
          },
          requests.length === 0 && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HelpRequestCard
            request={item}
            onPress={() => handleRequestPress(item)}
            showAIScore={isVolunteer}
          />
        )}
        ListHeaderComponent={requests.length > 0 ? renderHeader : null}
        ListEmptyComponent={isLoading ? null : renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />

      {!isVolunteer ? (
        <View
          style={[
            styles.fabContainer,
            { bottom: tabBarHeight + Spacing.lg },
          ]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("MyRequests");
            }}
            style={({ pressed }) => [
              styles.fabSecondary,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Feather name="list" size={20} color={theme.primary} />
            <ThemedText
              type="small"
              style={[styles.fabSecondaryText, { color: theme.primary }]}
            >
              My Requests
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("RequestHelp");
            }}
            style={({ pressed }) => [
              styles.fabPrimary,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
            <ThemedText style={styles.fabPrimaryText}>Request Help</ThemedText>
          </Pressable>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  aiTip: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  aiTipText: {
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    alignItems: "flex-end",
    gap: Spacing.md,
  },
  fabSecondary: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  fabSecondaryText: {
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  fabPrimary: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
});
