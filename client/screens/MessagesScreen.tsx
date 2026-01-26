import React, { useState, useCallback } from "react";
import { StyleSheet, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedView } from "@/components/ThemedView";
import { ConversationItem } from "@/components/ConversationItem";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing } from "@/constants/theme";
import { Conversation, Message } from "@/types";
import { api } from "@/lib/api";
import * as Haptics from "expo-haptics";

interface MessagesScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface ConversationWithMessage extends Conversation {
  lastMessage?: Message;
}

export default function MessagesScreen({ navigation }: MessagesScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationWithMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const apiConversations = await api.conversations.list(user.id);
      const formattedConversations: ConversationWithMessage[] = apiConversations.map((conv) => ({
        ...conv,
        participants: [
          { id: conv.participant1Id, name: conv.participant1Name },
          { id: conv.participant2Id, name: conv.participant2Name },
        ],
      }));
      setConversations(formattedConversations);
    } catch (error) {
      console.error("Neuspjelo učitavanje konverzacija:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadConversations();
  }, [loadConversations]);

  const handleConversationPress = (conversation: ConversationWithMessage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Konverzacija", { conversation });
  };

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-messages.png")}
      title="Nema konverzacija još"
      description="Kada se povežeš s nekim za pomoć, tvoje poruke će se pojaviti ovdje"
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          conversations.length === 0 && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            currentUserId={user?.id || ""}
            onPress={() => handleConversationPress(item)}
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
  listContent: {},
  emptyContent: {
    flexGrow: 1,
  },
});
