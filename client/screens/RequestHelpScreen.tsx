import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { CategoryChip } from "@/components/CategoryChip";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, HelpCategories, HelpCategoryId } from "@/constants/theme";
import { api } from "@/lib/api";
import * as Haptics from "expo-haptics";

interface RequestHelpScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function RequestHelpScreen({ navigation }: RequestHelpScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [category, setCategory] = useState<HelpCategoryId | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("My Location");
  const [urgency, setUrgency] = useState<"urgent" | "flexible">("flexible");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!category) {
      setError("Molimo izaberite kategoriju pomoći.");
      return;
    }

    if (!description.trim()) {
      setError("Molimo opišite šta vam je potrebno.");
      return;
    }

    if (!user) {
      setError("Morate biti prijavljeni da biste kreirali zahtjev.");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await api.helpRequests.create({
        userId: user.id,
        userName: user.name,
        category,
        description: description.trim(),
        urgency,
        latitude: 44.7866 + Math.random() * 0.1 - 0.05,
        longitude: 20.4489 + Math.random() * 0.1 - 0.05,
        address: address || "My Location",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Neuspješno kreiranje zahtjeva";
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h2" style={styles.title}>
          Zatražite pomoć
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Recite vašoj zajednici šta vam je potrebno
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Koju vrstu pomoći trebate?
          </ThemedText>
          <View style={styles.categoriesGrid}>
            {HelpCategories.map((cat) => (
              <CategoryChip
                key={cat.id}
                categoryId={cat.id}
                selected={category === cat.id}
                onPress={() => setCategory(cat.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Opišite šta vam je potrebno
          </ThemedText>
          <View
            style={[
              styles.textAreaContainer,
              {
                borderColor: theme.inputBorder,
                backgroundColor: theme.backgroundDefault,
              },
            ]}
          >
            <Input
              placeholder="Npr., Potreban mi je neko da mi pomogne da ponesem namirnice iz prodavnice..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              style={styles.textArea}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Lokacija
          </ThemedText>
          <Pressable
            style={[
              styles.locationButton,
              {
                borderColor: theme.inputBorder,
                backgroundColor: theme.backgroundDefault,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Feather name="map-pin" size={20} color={theme.primary} />
            <ThemedText type="body" style={styles.locationText}>
              {address}
            </ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <ThemedText
            type="small"
            style={[styles.hint, { color: theme.textSecondary }]}
          >
            Vaša približna lokacija biće podijeljena sa volonterima
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Koliko je hitno?
          </ThemedText>
          <View style={styles.urgencyOptions}>
            <UrgencyOption
              label="Fleksibilno"
              description="Može sačekati par dana"
              icon="clock"
              selected={urgency === "flexible"}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setUrgency("flexible");
              }}
              theme={theme}
            />
            <UrgencyOption
              label="Hitno"
              description="Pomoć potrebna uskoro"
              icon="alert-circle"
              selected={urgency === "urgent"}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setUrgency("urgent");
              }}
              theme={theme}
              isUrgent
            />
          </View>
        </View>

        {error ? (
          <ThemedText
            type="small"
            style={[styles.error, { color: theme.error }]}
          >
            {error}
          </ThemedText>
        ) : null}

        <Button
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        >
          {isLoading ? "Objavljivanje..." : "Objavi zahtjev"}
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

function UrgencyOption({
  label,
  description,
  icon,
  selected,
  onPress,
  theme,
  isUrgent = false,
}: {
  label: string;
  description: string;
  icon: any;
  selected: boolean;
  onPress: () => void;
  theme: any;
  isUrgent?: boolean;
}) {
  const accentColor = isUrgent ? theme.error : theme.secondary;
  const borderColor = selected ? accentColor : theme.border;
  const bgColor = selected ? accentColor + "10" : theme.backgroundDefault;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.urgencyOption,
        {
          borderColor,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Feather
        name={icon}
        size={24}
        color={selected ? accentColor : theme.textSecondary}
      />
      <ThemedText type="body" style={styles.urgencyLabel}>
        {label}
      </ThemedText>
      <ThemedText
        type="small"
        style={{ color: theme.textSecondary }}
      >
        {description}
      </ThemedText>
    </Pressable>
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
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  textAreaContainer: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
  },
  locationText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  hint: {
    marginTop: Spacing.xs,
    fontStyle: "italic",
  },
  urgencyOptions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  urgencyOption: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
  },
  urgencyLabel: {
    fontWeight: "600",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});