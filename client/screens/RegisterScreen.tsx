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
import * as Haptics from "expo-haptics";

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [jmbg, setJmbg] = useState("");
  const [role, setRole] = useState<"user" | "volunteer">("user");
  const [selectedCategories, setSelectedCategories] = useState<HelpCategoryId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleCategory = (categoryId: HelpCategoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleRegister = async () => {
    setError("");

    if (!email || !password || !name || !jmbg) {
      setError("Molimo popunite sva obavezna polja.");
      return;
    }

    if (jmbg.length !== 13 || !/^\d+$/.test(jmbg)) {
      setError("JMBG mora imati tačno 13 cifara.");
      return;
    }

    if (role === "volunteer" && selectedCategories.length === 0) {
      setError("Molimo izaberite bar jednu kategoriju pomoći.");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await register({
      email,
      password,
      name,
      jmbg,
      role,
      helpCategories: selectedCategories,
    });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Registracija nije uspjela.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          Kreirajte Vaš nalog
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Pridružite se LinkMe i povežite se sa svojom zajednicom
        </ThemedText>

        <Input
          label="Email"
          icon="mail"
          placeholder="vas@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Input
          label="Lozinka"
          icon="lock"
          placeholder="Kreirajte lozinku"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <Input
          label="Ime ili nadimak"
          icon="user"
          placeholder="Kako da Vas zovemo?"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.jmbgContainer}>
          <View style={styles.jmbgLabelRow}>
            <ThemedText type="small" style={styles.label}>
              JMBG (Lična karta)
            </ThemedText>
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Feather
                name="info"
                size={16}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>
          <Input
            placeholder="13-cifreni lični broj"
            keyboardType="number-pad"
            maxLength={13}
            value={jmbg}
            onChangeText={setJmbg}
          />
          <ThemedText
            type="small"
            style={[styles.jmbgNote, { color: theme.textSecondary }]}
          >
            Korišćeno samo da bi se osiguralo po jedan nalog po osobi. Sigurno heširano.
          </ThemedText>
        </View>

        <View style={styles.roleSection}>
          <ThemedText type="small" style={styles.label}>
            Želim da:
          </ThemedText>
          <View style={styles.roleOptions}>
            <RoleOption
              role="user"
              label="Primam pomoć"
              description="Trebam asistenciju od volontera"
              icon="help-circle"
              selected={role === "user"}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRole("user");
              }}
              theme={theme}
            />
            <RoleOption
              role="volunteer"
              label="Volontiram"
              description="Želim da pomognem drugima u potrebi"
              icon="heart"
              selected={role === "volunteer"}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRole("volunteer");
              }}
              theme={theme}
            />
          </View>
        </View>

        {role === "volunteer" ? (
          <View style={styles.categoriesSection}>
            <ThemedText type="small" style={styles.label}>
              Koje vrste pomoći možete da pružite?
            </ThemedText>
            <View style={styles.categoriesGrid}>
              {HelpCategories.map((category) => (
                <CategoryChip
                  key={category.id}
                  categoryId={category.id}
                  selected={selectedCategories.includes(category.id)}
                  onPress={() => toggleCategory(category.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {error ? (
          <ThemedText
            type="small"
            style={[styles.error, { color: theme.error }]}
          >
            {error}
          </ThemedText>
        ) : null}

        <Button
          onPress={handleRegister}
          disabled={isLoading}
          style={styles.button}
        >
          {isLoading ? "Kreiranje naloga..." : "Kreirajte nalog"}
        </Button>

        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={styles.loginLink}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Već imate nalog?{" "}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
            Prijavite se
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function RoleOption({
  role,
  label,
  description,
  icon,
  selected,
  onPress,
  theme,
}: {
  role: string;
  label: string;
  description: string;
  icon: any;
  selected: boolean;
  onPress: () => void;
  theme: any;
}) {
  const borderColor = selected
    ? role === "volunteer"
      ? theme.secondary
      : theme.primary
    : theme.border;
  const bgColor = selected
    ? role === "volunteer"
      ? theme.secondary + "10"
      : theme.primary + "10"
    : theme.backgroundDefault;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roleOption,
        {
          borderColor,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Feather
        name={icon}
        size={24}
        color={selected ? (role === "volunteer" ? theme.secondary : theme.primary) : theme.textSecondary}
      />
      <ThemedText type="body" style={styles.roleLabel}>
        {label}
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.roleDescription, { color: theme.textSecondary }]}
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
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  label: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  jmbgContainer: {
    marginBottom: Spacing.lg,
  },
  jmbgLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  jmbgNote: {
    marginTop: -Spacing.sm,
    fontStyle: "italic",
  },
  roleSection: {
    marginBottom: Spacing.xl,
  },
  roleOptions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleOption: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
  },
  roleLabel: {
    fontWeight: "600",
    marginTop: Spacing.sm,
  },
  roleDescription: {
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  categoriesSection: {
    marginBottom: Spacing.xl,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing.sm,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  button: {
    marginBottom: Spacing.lg,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});