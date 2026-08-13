import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    async function verificarFluxo() {
      if (carregando) return;

      // 1. Se o usuário já está logado, vai para o Dashboard 
      if (usuario) {
        //IMPORTANTE Por enquanto direcionado para login até ter o dashboard
        return;
      }

      // 2. Verificar se o onboarding já foi visto
      const onboardingVisto = await SecureStore.getItemAsync('@IndigoFinance:onboarding_visto');

      if (onboardingVisto === 'true') {
        router.replace('/login');
      } else {
        router.replace('/onboarding');
      }
    }

    verificarFluxo();
  }, [usuario, carregando]);

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <ActivityIndicator size="large" color="#4f46e5" />
    </View>
  );
}