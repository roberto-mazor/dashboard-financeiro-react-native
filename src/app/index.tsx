import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Wallet, PieChart, ShieldCheck } from 'lucide-react-native';

const PASSOS = [
  {
    id: 1,
    icone: Wallet,
    titulo: 'Controle Total',
    descricao: 'Acompanhe suas receitas, despesas e saldo em tempo real em um só lugar.',
  },
  {
    id: 2,
    icone: PieChart,
    titulo: 'Gráficos Inteligentes',
    descricao: 'Visualize para onde vai o seu dinheiro com relatórios simples e intuitivos.',
  },
  {
    id: 3,
    icone: ShieldCheck,
    titulo: 'Cartões & Limites',
    descricao: 'Gerencie seus cartões de crédito e simule vínculos bancários com facilidade.',
  },
];

export default function Onboarding() {
  const [passoAtual, setPassoAtual] = useState(0);

  function irParaLogin() {
    router.push('/login');
  }

  function proximoPasso() {
    if (passoAtual < PASSOS.length - 1) {
      setPassoAtual(passoAtual + 1);
    } else {
      irParaLogin();
    }
  }

  const Item = PASSOS[passoAtual];
  const Icone = Item.icone;

  return (
    <SafeAreaView className="flex-1 bg-background justify-between p-6">

      {/* Botão Pular */}
      <View className="items-end">
        <TouchableOpacity onPress={irParaLogin}>
          <Text className="text-variant text-sm font-semibold">Pular</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Central */}
      <View className="items-center px-4">
        <View className="w-24 h-24 bg-indigo-PRIMARY/10 rounded-full items-center justify-center mb-8">
          <Icone size={48} color="#4f46e5" />
        </View>

        <Text className="text-2xl font-bold text-slate-900 text-center mb-3">
          {Item.titulo}
        </Text>

        <Text className="text-base text-variant text-center leading-6">
          {Item.descricao}
        </Text>
      </View>

      {/* Rodapé */}
      <View className="mb-6">
        {/* Indicadores (3 Pontinhos) */}
        <View className="flex-row justify-center mb-8">
          {PASSOS.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${index === passoAtual ? 'w-8 bg-indigo-PRIMARY' : 'w-2 bg-slate-300'
                }`}
            />
          ))}
        </View>

        {/* Botão Avançar */}
        <TouchableOpacity
          className="bg-indigo-PRIMARY py-4 rounded-xl items-center"
          onPress={proximoPasso}
        >
          <Text className="text-white font-bold text-base">
            {passoAtual === PASSOS.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}