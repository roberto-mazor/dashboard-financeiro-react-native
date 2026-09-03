import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ArrowLeftRight, User, CreditCard } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 14,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size ?? 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transacoes"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color, size }) => (
            <ArrowLeftRight size={size ?? 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <User size={size ?? 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cartoes"
        options={{
          title: 'Cartões',
          tabBarIcon: ({ color, size }) => (
            <CreditCard size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}