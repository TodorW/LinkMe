import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#212121",
    textSecondary: "#757575",
    textDisabled: "#BDBDBD",
    buttonText: "#FFFFFF",
    tabIconDefault: "#757575",
    tabIconSelected: "#FF6B35",
    link: "#FF6B35",
    primary: "#FF6B35",
    primaryVariant: "#E85A28",
    secondary: "#4ECDC4",
    success: "#43A047",
    error: "#D32F2F",
    backgroundRoot: "#FAFAFA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    backgroundTertiary: "#EEEEEE",
    border: "#E0E0E0",
    inputBorder: "#BDBDBD",
    roleUser: "#FF6B35",
    roleVolunteer: "#4ECDC4",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    textDisabled: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FF6B35",
    link: "#FF8A65",
    primary: "#FF6B35",
    primaryVariant: "#FF8A65",
    secondary: "#4ECDC4",
    success: "#66BB6A",
    error: "#EF5350",
    backgroundRoot: "#121212",
    backgroundDefault: "#1E1E1E",
    backgroundSecondary: "#2A2A2A",
    backgroundTertiary: "#363636",
    border: "#404040",
    inputBorder: "#555555",
    roleUser: "#FF6B35",
    roleVolunteer: "#4ECDC4",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: "Nunito_600SemiBold",
  },
  h4: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
    fontFamily: "Nunito_600SemiBold",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    fontFamily: "Nunito_600SemiBold",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Nunito_400Regular",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "Nunito_400Regular",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Nunito, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const HelpCategories = [
  { id: "shopping", label: "Shopping", icon: "shopping-bag" },
  { id: "cleaning", label: "Cleaning", icon: "home" },
  { id: "tools", label: "Tools", icon: "tool" },
  { id: "transport", label: "Transport", icon: "truck" },
  { id: "tech", label: "Tech Help", icon: "cpu" },
  { id: "other", label: "Other", icon: "more-horizontal" },
] as const;

export type HelpCategoryId = typeof HelpCategories[number]["id"];
