import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RoleBadge } from "@/components/RoleBadge";
import { StarRating } from "@/components/StarRating";
import { CategoryChip } from "@/components/CategoryChip";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, HelpCategories, HelpCategoryId } from "@/constants/theme";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, logout, updateRole, updateCategories } = useAuth();

  const [isVolunteer, setIsVolunteer] = useState(user?.role === "volunteer");
  const [selectedCategories, setSelectedCategories] = useState<HelpCategoryId[]>(
    user?.helpCategories || []
  );

  const handleRoleToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVolunteer(value);
    await updateRole(value ? "volunteer" : "user");
  };

  const toggleCategory = async (categoryId: HelpCategoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((c) => c !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
    await updateCategories(newCategories);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ThemedText>Please log in to view your profile</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Image
            source={require("../../assets/images/default-avatar.png")}
            style={styles.avatar}
          />
          <ThemedText type="h2" style={styles.userName}>
            {user.name}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.userEmail, { color: theme.textSecondary }]}
          >
            {user.email}
          </ThemedText>
          <View style={styles.roleBadgeContainer}>
            <RoleBadge role={user.role} size="medium" />
          </View>
          <View style={styles.ratingContainer}>
            <StarRating rating={user.rating || 0} size={20} />
            <ThemedText
              type="small"
              style={[styles.ratingText, { color: theme.textSecondary }]}
            >
              {user.ratingCount > 0
                ? `${user.rating.toFixed(1)} (${user.ratingCount} reviews)`
                : "No reviews yet"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Role
          </ThemedText>
          <View
            style={[
              styles.settingRow,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather
                name={isVolunteer ? "heart" : "help-circle"}
                size={20}
                color={isVolunteer ? theme.secondary : theme.primary}
              />
              <View style={styles.settingText}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {isVolunteer ? "Volunteering" : "Seeking Help"}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {isVolunteer
                    ? "You can see and accept help requests"
                    : "You can create help requests"}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isVolunteer}
              onValueChange={handleRoleToggle}
              trackColor={{
                false: theme.backgroundTertiary,
                true: theme.secondary + "50",
              }}
              thumbColor={isVolunteer ? theme.secondary : theme.textDisabled}
            />
          </View>
        </View>

        {isVolunteer ? (
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Help Categories
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
            >
              Select the types of help you can provide
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

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          <SettingItem
            icon="bell"
            label="Notifications"
            theme={theme}
            onPress={() => {}}
          />
          <SettingItem
            icon="map-pin"
            label="Location Permissions"
            theme={theme}
            onPress={() => {}}
          />
          <SettingItem
            icon="shield"
            label="Privacy Policy"
            theme={theme}
            onPress={() => {}}
          />
          <SettingItem
            icon="help-circle"
            label="Help & Support"
            theme={theme}
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              {
                backgroundColor: theme.error + "10",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="log-out" size={20} color={theme.error} />
            <ThemedText
              type="body"
              style={[styles.logoutText, { color: theme.error }]}
            >
              Log Out
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText
          type="small"
          style={[styles.version, { color: theme.textDisabled }]}
        >
          LinkMe v1.0.0
        </ThemedText>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

function SettingItem({
  icon,
  label,
  theme,
  onPress,
}: {
  icon: any;
  label: string;
  theme: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.settingItem,
        {
          backgroundColor: pressed
            ? theme.backgroundSecondary
            : theme.backgroundDefault,
        },
      ]}
    >
      <Feather name={icon} size={20} color={theme.text} />
      <ThemedText type="body" style={styles.settingLabel}>
        {label}
      </ThemedText>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
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
  userEmail: {
    marginBottom: Spacing.md,
  },
  roleBadgeContainer: {
    marginBottom: Spacing.md,
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingText: {
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  settingLabel: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  logoutText: {
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
