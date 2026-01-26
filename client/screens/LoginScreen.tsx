import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Molimo popunite sva polja.");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await login(email, password);

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Prijava nije uspjela.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h1" style={styles.appName}>
            LinkMe
          </ThemedText>
        </View>

        <ThemedText type="h2" style={styles.title}>
          Dobrodošli nazad
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Prijavite se da biste nastavili da pomažete svojoj zajednici
        </ThemedText>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
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
            placeholder="Vaša lozinka"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          {error ? (
            <ThemedText
              type="small"
              style={[styles.error, { color: theme.error }]}
            >
              {error}
            </ThemedText>
          ) : null}

          <Button
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? "Prijavljivanje..." : "Prijavite se"}
          </Button>
        </View>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={styles.registerLink}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Nemate nalog?{" "}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
            Registrujte se
          </ThemedText>
        </Pressable>
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
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 28,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  button: {
    marginTop: Spacing.sm,
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});