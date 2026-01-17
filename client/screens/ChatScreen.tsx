import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Message, Conversation } from "@/types";
import { getMessages, saveMessage, saveConversation, generateId } from "@/lib/storage";
import * as Haptics from "expo-haptics";

interface ChatScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ Chat: { conversation: Conversation } }, "Chat">;
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { conversation } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== user?.id
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: otherParticipant?.name || "Chat",
    });
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const msgs = await getMessages(conversation.id);
      setMessages(msgs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user || isSending) return;

    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: Message = {
      id: generateId(),
      conversationId: conversation.id,
      senderId: user.id,
      senderName: user.name,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    try {
      await saveMessage(newMessage);
      
      const updatedConversation: Conversation = {
        ...conversation,
        lastMessage: newMessage,
        updatedAt: new Date().toISOString(),
      };
      await saveConversation(updatedConversation);

      setMessages((prev) => [newMessage, ...prev]);
      setInputText("");
    } catch (error) {
      console.error("Failed to send message:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.myMessage : styles.theirMessage,
          {
            backgroundColor: isMine
              ? theme.primary
              : theme.backgroundSecondary,
          },
        ]}
      >
        <ThemedText
          type="body"
          style={[
            styles.messageText,
            { color: isMine ? "#FFFFFF" : theme.text },
          ]}
        >
          {item.text}
        </ThemedText>
        <ThemedText
          type="small"
          style={[
            styles.messageTime,
            {
              color: isMine
                ? "rgba(255,255,255,0.7)"
                : theme.textSecondary,
            },
          ]}
        >
          {formatTime(item.createdAt)}
        </ThemedText>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText
        type="body"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        Start the conversation by sending a message
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            {
              paddingTop: headerHeight + Spacing.md,
              paddingBottom: Spacing.md,
            },
            messages.length === 0 && styles.emptyContent,
          ]}
          inverted={messages.length > 0}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.backgroundRoot,
              borderTopColor: theme.border,
              paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.textDisabled}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor:
                    inputText.trim() && !isSending
                      ? theme.primary
                      : theme.backgroundTertiary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather
                name="send"
                size={18}
                color={inputText.trim() && !isSending ? "#FFFFFF" : theme.textDisabled}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    textAlign: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  myMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: Spacing.xs,
  },
  theirMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: Spacing.xs,
  },
  messageText: {
    marginBottom: Spacing.xs,
  },
  messageTime: {
    alignSelf: "flex-end",
    fontSize: 11,
  },
  inputContainer: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Platform.OS === "ios" ? Spacing.sm : Spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
});
