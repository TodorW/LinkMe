import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapScreen from "@/screens/MapScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { RoleBadge } from "@/components/RoleBadge";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/context/AuthContext";

export type MapStackParamList = {
  Map: undefined;
};

const Stack = createNativeStackNavigator<MapStackParamList>();

export default function MapStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerTitle: () => <HeaderTitle title="LinkMe" />,
          headerRight: () =>
            user ? <RoleBadge role={user.role} size="small" /> : null,
        }}
      />
    </Stack.Navigator>
  );
}
