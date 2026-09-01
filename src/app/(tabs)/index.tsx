import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
} from 'lucide-react-native';
import { ModalTransacao } from '@/components/ModalTransacao';

interface Transacao {
    id: number | string;
    id_transacao?: number | string;
    descricao: string;
    valor: number | string;
    tipo?: string;
    tipo_transacao?: string;
    data?: string;
    data_transacao?: string;
    created_at?: string;
    criado_em?: string;
    categoria?: string | { nome?: string; tipo?: string; status?: string };
    nome_categoria?: string;
}

interface ResumoFinanceiro {
    saldoTotal: number;
    totalReceitas: number;
    totalDespesas: number;
}

export default function Dashboard() {
    const { usuario } = useAuth();

    const [resumo, setResumo] = useState<ResumoFinanceiro>({
        saldoTotal: 0,
        totalReceitas: 0,
        totalDespesas: 0,
    });
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);

    function formatarMoeda(valor: number | string) {
        const numero = Number(valor) || 0;
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }

    function formatarDataHora(item: Transacao): string {
        const rawData = item.created_at || item.criado_em || item.data_transacao || item.data;
        if (!rawData) return '';

        try {
            const dataObj = new Date(rawData);
            if (isNaN(dataObj.getTime())) return '';

            const diaMes = dataObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });

            // Se tiver informação de hora/minuto
            if (rawData.includes('T') || rawData.includes(':')) {
                const horaMin = dataObj.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                return `${diaMes} às ${horaMin}`;
            }

            return diaMes;
        } catch {
            return '';
        }
    }

    function extrairNomeCategoria(item: Transacao): string {
        if (typeof item.categoria === 'string' && item.categoria.trim()) {
            return item.categoria;
        }
        if (typeof item.categoria === 'object' && item.categoria?.nome) {
            return item.categoria.nome;
        }
        if (item.nome_categoria) {
            return item.nome_categoria;
        }
        const t = String(item.tipo || item.tipo_transacao || '').toLowerCase();
        return t === 'receita' ? 'Entrada' : 'Saída';
    }

    async function carregarDados() {
        try {
            let saldoCalculado = 0;
            let receitasCalculadas = 0;
            let despesasCalculadas = 0;

            // 1. Busca lista de transações
            const resTransacoes = await api.get('/transacoes');
            const listaBruta: Transacao[] = resTransacoes.data?.transacoes || resTransacoes.data || [];

            if (Array.isArray(listaBruta)) {
                // Ordenação decrescente: por Data/Hora e por ID
                const listaOrdenada = [...listaBruta].sort((a: any, b: any) => {
                    const dataA = new Date(a.created_at || a.criado_em || a.data_transacao || a.data || 0).getTime();
                    const dataB = new Date(b.created_at || b.criado_em || b.data_transacao || b.data || 0).getTime();

                    if (dataB !== dataA) {
                        return dataB - dataA;
                    }

                    const idA = Number(a.id ?? a.id_transacao ?? 0);
                    const idB = Number(b.id ?? b.id_transacao ?? 0);
                    return idB - idA;
                });

                setTransacoes(listaOrdenada.slice(0, 10));

                listaOrdenada.forEach((item: any) => {
                    const val = Math.abs(Number(item.valor)) || 0;
                    const t = String(item.tipo || item.tipo_transacao || item.categoria?.tipo || '').toLowerCase();

                    if (t === 'receita') {
                        receitasCalculadas += val;
                    } else {
                        despesasCalculadas += val;
                    }
                });

                saldoCalculado = receitasCalculadas - despesasCalculadas;
            }

            // 2. Resumo
            try {
                const resResumo = await api.get('/dashboard/resumo');
                const d = resResumo.data || {};

                const recApi = Number(d.totalReceitas ?? d.total_receitas ?? d.receitas ?? 0);
                const despApi = Number(d.totalDespesas ?? d.total_despesas ?? d.despesas ?? 0);
                const saldoApi = Number(d.saldoTotal ?? d.saldo_atual ?? d.saldo ?? (recApi - despApi));

                if (recApi === 0 && despApi === 0 && (receitasCalculadas > 0 || despesasCalculadas > 0)) {
                    setResumo({
                        saldoTotal: saldoCalculado,
                        totalReceitas: receitasCalculadas,
                        totalDespesas: despesasCalculadas,
                    });
                } else {
                    setResumo({
                        saldoTotal: saldoApi,
                        totalReceitas: recApi,
                        totalDespesas: despApi,
                    });
                }
            } catch {
                setResumo({
                    saldoTotal: saldoCalculado,
                    totalReceitas: receitasCalculadas,
                    totalDespesas: despesasCalculadas,
                });
            }
        } catch (error: any) {
            console.error('Erro ao buscar dados do dashboard:', error.response?.data || error.message);
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [])
    );

    function handleRefresh() {
        setAtualizando(true);
        carregarDados();
    }

    return (
        <SafeAreaView style={styles.container}>
            {carregando ? (
                <View style={styles.centroLoading}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        refreshControl={
                            <RefreshControl
                                refreshing={atualizando}
                                onRefresh={handleRefresh}
                                colors={['#4f46e5']}
                            />
                        }
                    >
                        {/* Cabeçalho */}
                        <View style={styles.header}>
                            <Text style={styles.saudacao}>Bem-vindo de volta,</Text>
                            <Text style={styles.nomeUsuario}>{usuario?.nome || 'Usuário'}</Text>
                        </View>

                        {/* Card Saldo Atual */}
                        <View style={styles.cardSaldo}>
                            <View style={styles.cardSaldoTopo}>
                                <Text style={styles.labelSaldo}>Saldo Atual</Text>
                                <Wallet color="#ffffff" size={24} />
                            </View>
                            <Text style={styles.valorSaldo}>{formatarMoeda(resumo.saldoTotal)}</Text>
                        </View>

                        {/* Cards de Entradas e Saídas */}
                        <View style={styles.linhaCards}>
                            <View style={[styles.cardPequeno, styles.bordaReceita]}>
                                <View style={styles.topoCardPequeno}>
                                    <ArrowUpCircle color="#10b981" size={20} />
                                    <Text style={styles.labelPequeno}>Receitas</Text>
                                </View>
                                <Text style={styles.valorReceita}>{formatarMoeda(resumo.totalReceitas)}</Text>
                            </View>

                            <View style={[styles.cardPequeno, styles.bordaDespesa]}>
                                <View style={styles.topoCardPequeno}>
                                    <ArrowDownCircle color="#ef4444" size={20} />
                                    <Text style={styles.labelPequeno}>Despesas</Text>
                                </View>
                                <Text style={styles.valorDespesa}>{formatarMoeda(resumo.totalDespesas)}</Text>
                            </View>
                        </View>

                        {/* Lista de Transações Ordenada */}
                        <View style={styles.secao}>
                            <Text style={styles.tituloSecao}>Últimas Transações</Text>

                            {transacoes.length === 0 ? (
                                <View style={styles.cardVazio}>
                                    <Text style={styles.textoVazio}>Nenhuma transação registrada ainda.</Text>
                                </View>
                            ) : (
                                transacoes.map((item: any, index) => {
                                    const tipoItem = String(item.tipo || item.tipo_transacao || item.categoria?.tipo || '').toLowerCase();
                                    const ehReceita = tipoItem === 'receita';
                                    const chaveItem = item.id ?? item.id_transacao ?? index;
                                    const nomeCategoria = extrairNomeCategoria(item);
                                    const dataFormatada = formatarDataHora(item);

                                    return (
                                        <View key={chaveItem} style={styles.itemTransacao}>
                                            <View style={styles.transacaoEsquerda}>
                                                <View
                                                    style={[
                                                        styles.iconeTipo,
                                                        ehReceita ? styles.bgReceitaIcone : styles.bgDespesaIcone,
                                                    ]}
                                                >
                                                    {ehReceita ? (
                                                        <TrendingUp size={18} color="#10b981" />
                                                    ) : (
                                                        <TrendingDown size={18} color="#ef4444" />
                                                    )}
                                                </View>
                                                <View>
                                                    <Text style={styles.descricaoTransacao}>{item.descricao}</Text>
                                                    <View style={styles.metaTransacao}>
                                                        <Text style={styles.categoriaTransacao}>{nomeCategoria}</Text>
                                                        {dataFormatada ? (
                                                            <Text style={styles.dataTransacao}> • {dataFormatada}</Text>
                                                        ) : null}
                                                    </View>
                                                </View>
                                            </View>

                                            <Text
                                                style={[
                                                    styles.valorTransacao,
                                                    ehReceita ? styles.textoVerde : styles.textoVermelho,
                                                ]}
                                            >
                                                {ehReceita ? '+ ' : '- '}
                                                {formatarMoeda(item.valor)}
                                            </Text>
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    </ScrollView>

                    {/* Botão Flutuante */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setModalAberto(true)}
                        activeOpacity={0.85}
                    >
                        <Plus color="#ffffff" size={28} />
                    </TouchableOpacity>

                    {/* Modal */}
                    <ModalTransacao
                        visivel={modalAberto}
                        aoFechar={() => setModalAberto(false)}
                        aoSalvarSucesso={carregarDados}
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8ff',
    },
    centroLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        padding: 20,
        paddingBottom: 90,
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
    bordaReceita: {
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    bordaDespesa: {
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    topoCardPequeno: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    labelPequeno: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    valorReceita: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
    },
    valorDespesa: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    secao: {
        marginTop: 4,
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
    itemTransacao: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 10,
    },
    transacaoEsquerda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconeTipo: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgReceitaIcone: {
        backgroundColor: '#dcfce7',
    },
    bgDespesaIcone: {
        backgroundColor: '#fee2e2',
    },
    descricaoTransacao: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
    },
    metaTransacao: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    categoriaTransacao: {
        fontSize: 12,
        color: '#64748b',
    },
    dataTransacao: {
        fontSize: 11,
        color: '#94a3b8',
    },
    valorTransacao: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    textoVerde: {
        color: '#10b981',
    },
    textoVermelho: {
        color: '#ef4444',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
    },
});