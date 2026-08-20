import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';

import * as SecureStore from 'expo-secure-store';

import { Wallet, PieChart, ShieldCheck } from 'lucide-react-native';

// Dados das 3 Splash Screens baseadas no seu Figma
const PASSOS = [
  {
    id: 1,
    icone: Wallet,
    titulo: 'Controle Total',
    descricao:
      'Acompanhe suas receitas, despesas e saldo em tempo real em um só lugar.',
  },
  {
    id: 2,
    icone: PieChart,
    titulo: 'Gráficos Inteligentes',
    descricao:
      'Visualize para onde vai o seu dinheiro com relatórios simples e intuitivos.',
  },
  {
    id: 3,
    icone: ShieldCheck,
    titulo: 'Cartões & Limites',
    descricao:
      'Gerencie seus cartões de crédito e simule vínculos bancários com facilidade.',
  },
];

export default function Onboarding() {
  const [passoAtual, setPassoAtual] = useState(0);

  async function concluirOnboarding() {
    // Salva que o usuário já viu as Splash Screens
    await SecureStore.setItemAsync(
      '@IndigoFinance:onboarding_visto',
      'true'
    );

    // Navega para a tela de Login
    router.replace('/login');
  }

  function proximoPasso() {
    if (passoAtual < PASSOS.length - 1) {
      setPassoAtual(passoAtual + 1);
    } else {
      concluirOnboarding();
    }
  }

  const Item = PASSOS[passoAtual];
  const Icone = Item.icone;

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão Pular */}
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={concluirOnboarding}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Central da Splash Screen */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icone size={48} color="#4f46e5" />
        </View>

        <Text style={styles.title}>
          {Item.titulo}
        </Text>

        <Text style={styles.description}>
          {Item.descricao}
        </Text>
      </View>

      {/* Rodapé: Indicadores de Páginas e Botão Próximo */}
      <View style={styles.footer}>
        {/* Indicadores */}
        <View style={styles.indicators}>
          {PASSOS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === passoAtual
                  ? styles.activeIndicator
                  : styles.inactiveIndicator,
              ]}
            />
          ))}
        </View>

        {/* Botão Avançar */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={proximoPasso}
        >
          <Text style={styles.nextButtonText}>
            {passoAtual === PASSOS.length - 1
              ? 'Começar'
              : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
    justifyContent: 'space-between',
    padding: 24,
  },

  // Botão Pular
  skipContainer: {
    alignItems: 'flex-end',
  },

  skipText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },

  // Conteúdo central
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#eef2ff',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },

  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },

  description: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Rodapé
  footer: {
    marginBottom: 24,
  },

  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },

  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  activeIndicator: {
    width: 32,
    backgroundColor: '#4f46e5',
  },

  inactiveIndicator: {
    width: 8,
    backgroundColor: '#cbd5e1',
  },

  // Botão próximo
  nextButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});