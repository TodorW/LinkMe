import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
  StyleProp,
  TextStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  icon,
  isPassword,
  style,
  multiline,
  numberOfLines,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? theme.error
    : isFocused
    ? theme.primary
    : theme.inputBorder;

  const isMultiline = multiline || (numberOfLines && numberOfLines > 1);

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText type="small" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: theme.backgroundDefault,
            minHeight: isMultiline ? Spacing.inputHeight * 2 : Spacing.inputHeight,
            alignItems: isMultiline ? "flex-start" : "center",
            paddingVertical: isMultiline ? Spacing.md : 0,
          },
        ]}
      >
        {icon ? (
          <Feather
            name={icon}
            size={20}
            color={isFocused ? theme.primary : theme.textSecondary}
            style={[styles.icon, isMultiline && { marginTop: 2 }]}
          />
        ) : null}
        <TextInput
          style={[
            styles.input,
            { color: theme.text },
            icon ? styles.inputWithIcon : null,
            isMultiline ? styles.multilineInput : null,
            style as StyleProp<TextStyle>,
          ]}
          placeholderTextColor={theme.textDisabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={isMultiline ? "top" : "center"}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText
          type="small"
          style={[styles.error, { color: theme.error }]}
        >
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  multilineInput: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  error: {
    marginTop: Spacing.xs,
  },
});
