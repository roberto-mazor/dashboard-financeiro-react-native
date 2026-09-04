import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.container}>

      {/* Botão Pular */}
      <View style={styles.header}>
        <TouchableOpacity onPress={irParaLogin}>
          <Text style={styles.textoPular}>Pular</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Central */}
      <View style={styles.conteudo}>
        <View style={styles.circuloIcone}>
          <Icone size={48} color="#4f46e5" />
        </View>
        <Text style={styles.titulo}>{Item.titulo}</Text>
        <Text style={styles.descricao}>{Item.descricao}</Text>
      </View>

      {/* Rodapé */}
      <View style={styles.rodape}>
        {/* Indicadores (3 Pontinhos) */}
        <View style={styles.indicadores}>
          {PASSOS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.ponto,
                index === passoAtual ? styles.pontoAtivo : styles.pontoInativo,
              ]}
            />
          ))}
        </View>

        {/* Botão Próximo */}
        <TouchableOpacity style={styles.botao} onPress={proximoPasso}>
          <Text style={styles.textoBotao}>
            {passoAtual === PASSOS.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8ff',
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    alignItems: 'flex-end',
  },
  textoPular: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  conteudo: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  circuloIcone: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  descricao: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  rodape: {
    marginBottom: 16,
  },
  indicadores: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ponto: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  pontoAtivo: {
    width: 32,
    backgroundColor: '#4f46e5',
  },
  pontoInativo: {
    width: 8,
    backgroundColor: '#cbd5e1',
  },
  botao: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});