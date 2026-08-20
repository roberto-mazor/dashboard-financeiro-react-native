import React from "react";
import { Slot } from "expo-router";
import { Tabs } from 'expo-router'
import { LayoutDashboard, ArrowLeftRight, CreditCard, User } from "lucide-react-native";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
      },
      tabBarLabelStyle:{
        fontSize:12,
        fontWeight: '600',
      },
    }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size}) => <LayoutDashboard color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="trasacoes"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color, size }) => <ArrowLeftRight color={color} size={size}/>,
        }}
      />
      <Tabs.Screen 
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size}/>,
        }}
      />
    </Tabs>
  );
}