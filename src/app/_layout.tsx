import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootNavigation() {
  const { usuario, carregando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;

    const noGrupoTabs = segments[0] === '(tabs)';

    if (!usuario && noGrupoTabs) {
      // Se não está logado e tentou acessar área restrita
      router.replace('/login');
    } else if (usuario && !noGrupoTabs) {
      // Se já está logado e está no Onboarding ou Login
      router.replace('/(tabs)');
    }
  }, [usuario, carregando, segments]);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fcf8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});