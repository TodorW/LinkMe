import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HelpRequest, Conversation } from "@/types";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import WelcomeScreen from "@/screens/WelcomeScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import LoginScreen from "@/screens/LoginScreen";
import RequestHelpScreen from "@/screens/RequestHelpScreen";
import MyRequestsScreen from "@/screens/MyRequestsScreen";
import HelpDetailScreen from "@/screens/HelpDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import RatingScreen from "@/screens/RatingScreen";

export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Main: undefined;
  RequestHelp: undefined;
  MyRequests: undefined;
  HelpDetail: { request: HelpRequest };
  Chat: { conversation: Conversation };
  Rating: { request: HelpRequest };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const screenOptions = useScreenOptions();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RequestHelp"
            component={RequestHelpScreen}
            options={{
              headerTitle: "Request Help",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="MyRequests"
            component={MyRequestsScreen}
            options={{
              headerTitle: "My Requests",
            }}
          />
          <Stack.Screen
            name="HelpDetail"
            component={HelpDetailScreen}
            options={{
              headerTitle: "Request Details",
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              headerTitle: "Chat",
            }}
          />
          <Stack.Screen
            name="Rating"
            component={RatingScreen}
            options={{
              headerTitle: "Rate Experience",
              presentation: "modal",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerTitle: "Register",
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerTitle: "Sign In",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
