import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width } = Dimensions.get("window");

interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.heroSection,
          { paddingTop: insets.top + Spacing.xl },
        ]}
      >
        <View
          style={[
            styles.illustrationContainer,
            { backgroundColor: theme.primary + "10" },
          ]}
        >
          <Image
            source={require("../../assets/images/welcome-illustration.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.contentSection}>
        <View style={styles.logoRow}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h1" style={styles.appName}>
            LinkMe
          </ThemedText>
        </View>

        <ThemedText type="h2" style={styles.tagline}>
          Poveži se. Pomozi. Rastimo zajedno.
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          Pridruži se svojoj lokalnoj zajednici i napravi razliku. Bilo da ti treba pomoć 
          ili želiš da volontiraš, LinkMe povezuje komšije za 
          svakodnevnu mikro-solidarnost.
        </ThemedText>

        <View style={styles.features}>
          <FeatureItem
            icon="map-pin"
            text="Find help nearby"
            theme={theme}
          />
          <FeatureItem
            icon="heart"
            text="Support your neighbors"
            theme={theme}
          />
          <FeatureItem
            icon="star"
            text="Build trusted connections"
            theme={theme}
          />
        </View>
      </View>

      <View
        style={[
          styles.buttonSection,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Button
          onPress={() => navigation.navigate("Register")}
          style={styles.primaryButton}
        >
          Započni
        </Button>
        <Button
          onPress={() => navigation.navigate("Login")}
          style={[
            styles.secondaryButton,
            {
              backgroundColor: "transparent",
              borderWidth: 2,
              borderColor: theme.primary,
            },
          ]}
        >
          <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>
            Već imam nalog
          </ThemedText>
        </Button>
      </View>
    </ThemedView>
  );
}

function FeatureItem({
  icon,
  text,
  theme,
}: {
  icon: string;
  text: string;
  theme: any;
}) {
  const { Feather } = require("@expo/vector-icons");

  return (
    <View style={styles.featureItem}>
      <View
        style={[
          styles.featureIcon,
          { backgroundColor: theme.secondary + "20" },
        ]}
      >
        <Feather name={icon} size={16} color={theme.secondary} />
      </View>
      <ThemedText type="small" style={styles.featureText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  illustrationContainer: {
    width: width - Spacing.xl * 2,
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: Spacing.sm,
  },
  appName: {
    fontSize: 32,
  },
  tagline: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  features: {
    alignItems: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  featureText: {
    fontWeight: "500",
  },
  buttonSection: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
});
