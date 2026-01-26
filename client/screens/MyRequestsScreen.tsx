import React, { useState, useCallback } from "react";
import { StyleSheet, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedView } from "@/components/ThemedView";
import { HelpRequestCard } from "@/components/HelpRequestCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing } from "@/constants/theme";
import { HelpRequest } from "@/types";
import { api } from "@/lib/api";
import * as Haptics from "expo-haptics";

interface MyRequestsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function MyRequestsScreen({ navigation }: MyRequestsScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      const myRequests = await api.helpRequests.list({ userId: user.id });
      setRequests(myRequests);
    } catch (error) {
      console.error("Neuspješno učitavanje zahtjeva:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

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

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-requests.png")}
      title="Još nema zahtjeva"
      description="Kada kreirate zahtjeve za pomoć, oni će se pojaviti ovdje"
      actionLabel="Kreiraj zahtjev"
      onAction={() => navigation.navigate("RequestHelp")}
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
            paddingBottom: insets.bottom + Spacing.xl,
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
          />
        )}
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
});