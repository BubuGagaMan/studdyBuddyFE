// src/app/(tabs)/_layout.tsx
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBarPaper } from "@/shared/ui/navigation/TabBarPaper";
import { useTheme } from "@/shared/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.inkMuted,
        tabBarBackground: () => <TabBarPaper />,

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
          // dropped: with an href, react-native-web renders a real link and each tab
          // press reloads the whole page instead of switching tabs
          href: _href,
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
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 70 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.hand,
          fontSize: 12,
          lineHeight: 18,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
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
