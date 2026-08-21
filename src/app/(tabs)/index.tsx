import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react-native';

export default function Dashboard() {
    const { usuario } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                {/* Cabeçalho de Boas-Vindas */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.saudacao}>Olá,</Text>
                        <Text style={styles.nomeUsuario}>{usuario?.nome || 'Usuário'}</Text>
                    </View>
                </View>

                {/* Card Saldo Total */}
                <View style={styles.cardSaldo}>
                    <View style={styles.cardSaldoTopo}>
                        <Text style={styles.labelSaldo}>Saldo Total</Text>
                        <Wallet color="#ffffff" size={24} />
                    </View>
                    <Text style={styles.valorSaldo}>R$ 0,00</Text>
                </View>

                {/* Linha com Entradas e Saídas */}
                <View style={styles.linhaCards}>
                    {/* Card Receitas */}
                    <View style={[styles.cardPequeno, styles.cardReceita]}>
                        <ArrowUpCircle color="#10b981" size={24} />
                        <Text style={styles.labelPequeno}>Receitas</Text>
                        <Text style={styles.valorReceita}>R$ 0,00</Text>
                    </View>

                    {/* Card Despesas */}
                    <View style={[styles.cardPequeno, styles.cardDespesa]}>
                        <ArrowDownCircle color="#ef4444" size={24} />
                        <Text style={styles.labelPequeno}>Despesas</Text>
                        <Text style={styles.valorDespesa}>R$ 0,00</Text>
                    </View>
                </View>

                {/* Seção Transações Recentes */}
                <View style={styles.secao}>
                    <Text style={styles.tituloSecao}>Transações Recentes</Text>
                    <View style={styles.cardVazio}>
                        <Text style={styles.textoVazio}>Nenhuma transação registrada.</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8ff',
    },
    scroll: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    saudacao: {
        fontSize: 14,
        color: '#64748b',
    },
    nomeUsuario: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    cardSaldo: {
        backgroundColor: '#4f46e5',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
    },
    cardSaldoTopo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelSaldo: {
        color: '#e0e7ff',
        fontSize: 14,
        fontWeight: '500',
    },
    valorSaldo: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    linhaCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    cardPequeno: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 1,
    },
    cardReceita: {
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    cardDespesa: {
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    labelPequeno: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
    },
    valorReceita: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
        marginTop: 2,
    },
    valorDespesa: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
        marginTop: 2,
    },
    secao: {
        marginTop: 8,
    },
    tituloSecao: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 12,
    },
    cardVazio: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    textoVazio: {
        color: '#94a3b8',
        fontSize: 14,
    },
});