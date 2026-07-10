// src/app/(tabs)/_layout.tsx
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        // FIX: Extract `ref` alongside the other props and cast it to a strict View Ref
        tabBarButton: ({
          delayLongPress,
          disabled,
          onBlur,
          onFocus,
          onPress,
          onLongPress,
          onPressIn,
          onPressOut,
          children,
          ref,
          ...props
        }) => (
          <TouchableOpacity
            {...props}
            ref={ref as React.Ref<View>}
            delayLongPress={delayLongPress ?? undefined}
            disabled={disabled ?? undefined}
            onBlur={onBlur ?? undefined}
            onFocus={onFocus ?? undefined}
            onPress={onPress ?? undefined}
            onLongPress={onLongPress ?? undefined}
            onPressIn={onPressIn ?? undefined}
            onPressOut={onPressOut ?? undefined}
            activeOpacity={0.5}
          >
            {children as React.ReactNode}
          </TouchableOpacity>
        ),

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Checklists",
          tabBarIcon: ({ color }) => (
            <Feather name="check-square" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color }) => (
            <Feather name="target" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => (
            <Feather name="pie-chart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
