import React, { useState, useCallback, useMemo } from 'react';
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
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from 'lucide-react-native';
import { PieChart } from 'react-native-gifted-charts';
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
    id_cartao?: number | null;
    cartao?: { id_cartao?: number; nome?: string; bandeira?: string } | null;
}

interface ResumoFinanceiro {
    saldoTotal: number;
    totalReceitas: number;
    totalDespesas: number;
}

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CORES_GRAFICO = [
    '#4f46e5', // Índigo
    '#ef4444', // Vermelho
    '#f59e0b', // Âmbar
    '#10b981', // Verde esmeralda
    '#06b6d4', // Ciano
    '#8b5cf6', // Roxo
    '#ec4899', // Rosa
];

export default function Dashboard() {
    const { usuario } = useAuth();

    const [dataSelecionada, setDataSelecionada] = useState(new Date());
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
        const rawData = item.data || item.data_transacao || item.created_at || item.criado_em;
        if (!rawData) return '';

        try {
            const dataObj = new Date(rawData);
            if (isNaN(dataObj.getTime())) return '';

            const diaMes = dataObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });

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

    function extrairNomeCartao(item: Transacao): string | null {
        if (item.cartao && typeof item.cartao === 'object' && item.cartao.nome) {
            return item.cartao.nome;
        }
        if (item.id_cartao) {
            return 'Cartão';
        }
        return null;
    }

    function mudarMes(direcao: 'anterior' | 'proximo') {
        const novaData = new Date(dataSelecionada);
        if (direcao === 'anterior') {
            novaData.setMonth(novaData.getMonth() - 1);
        } else {
            novaData.setMonth(novaData.getMonth() + 1);
        }
        setDataSelecionada(novaData);
    }

    function obterIntervaloMes(data: Date) {
        const ano = data.getFullYear();
        const mes = data.getMonth();
        const primeiroDia = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
        const ultimoDiaNum = new Date(ano, mes + 1, 0).getDate();
        const ultimoDia = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDiaNum).padStart(2, '0')}`;
        return { primeiroDia, ultimoDia };
    }

    const carregarDados = useCallback(async () => {
        try {
            const { primeiroDia, ultimoDia } = obterIntervaloMes(dataSelecionada);

            // 1. Busca transações do período
            const resTransacoes = await api.get('/transacoes', {
                params: {
                    data_inicio: primeiroDia,
                    data_fim: ultimoDia,
                },
            });
            const listaBruta: Transacao[] = resTransacoes.data?.transacoes || resTransacoes.data || [];

            let receitasCalculadas = 0;
            let despesasCalculadas = 0;

            if (Array.isArray(listaBruta)) {
                const listaOrdenada = [...listaBruta].sort((a: any, b: any) => {
                    const dataA = new Date(a.data || a.data_transacao || a.created_at || 0).getTime();
                    const dataB = new Date(b.data || b.data_transacao || b.created_at || 0).getTime();
                    if (dataB !== dataA) return dataB - dataA;

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
            }

            // 2. Busca resumo na API
            try {
                const resResumo = await api.get('/dashboard/resumo', {
                    params: {
                        data_inicio: primeiroDia,
                        data_fim: ultimoDia,
                    },
                });
                const d = resResumo.data || {};

                const recApi = Number(d.entradas ?? d.totalReceitas ?? d.receitas ?? 0);
                const despApi = Number(d.saidas ?? d.totalDespesas ?? d.despesas ?? 0);
                const saldoApi = Number(d.saldo ?? d.saldoTotal ?? d.saldo_atual ?? 0);

                setResumo({
                    saldoTotal: saldoApi,
                    totalReceitas: recApi > 0 ? recApi : receitasCalculadas,
                    totalDespesas: despApi > 0 ? despApi : despesasCalculadas,
                });
            } catch {
                setResumo({
                    saldoTotal: receitasCalculadas - despesasCalculadas,
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
    }, [dataSelecionada]);

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [carregarDados])
    );

    function handleRefresh() {
        setAtualizando(true);
        carregarDados();
    }

    // 3. Agrupamento das despesas por categoria para o gráfico (calculado via useMemo)
    const dadosGrafico = useMemo(() => {
        const mapaCategorias: Record<string, number> = {};

        transacoes.forEach((item: any) => {
            const t = String(item.tipo || item.tipo_transacao || item.categoria?.tipo || '').toLowerCase();
            if (t.includes('desp')) {
                const nomeCat = extrairNomeCategoria(item);
                const valor = Math.abs(Number(item.valor)) || 0;
                mapaCategorias[nomeCat] = (mapaCategorias[nomeCat] || 0) + valor;
            }
        });

        const totalDespesasGerais = Object.values(mapaCategorias).reduce((acc, v) => acc + v, 0);

        if (totalDespesasGerais === 0) return [];

        return Object.entries(mapaCategorias).map(([nome, valor], index) => {
            const porcentagem = ((valor / totalDespesasGerais) * 100).toFixed(0);
            return {
                value: valor,
                color: CORES_GRAFICO[index % CORES_GRAFICO.length],
                text: `${porcentagem}%`,
                nome,
                valorFormatado: valor.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                }),
                // propriedades de centralização na área do arco
                textColor: '#ffffff',
                textSize: 11,
                fontWeight: 'bold',
                shiftTextY: Number(porcentagem) > 50 ? +6 : 0,
            };
        });
    }, [transacoes]);

    const mesExtenso = `${MESES[dataSelecionada.getMonth()]} de ${dataSelecionada.getFullYear()}`;

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

                        {/* Seletor de Mês e Ano */}
                        <View style={styles.containerSeletorMes}>
                            <TouchableOpacity
                                style={styles.botaoSetaMes}
                                onPress={() => mudarMes('anterior')}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <ChevronLeft size={20} color="#475569" />
                            </TouchableOpacity>

                            <View style={styles.boxMesTexto}>
                                <Calendar size={15} color="#4f46e5" />
                                <Text style={styles.textoMesExtenso}>{mesExtenso}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.botaoSetaMes}
                                onPress={() => mudarMes('proximo')}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <ChevronRight size={20} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        {/* Card Saldo Atual */}
                        <View style={styles.cardSaldo}>
                            <View style={styles.cardSaldoTopo}>
                                <Text style={styles.labelSaldo}>Saldo Acumulado</Text>
                                <Wallet color="#ffffff" size={24} />
                            </View>
                            <Text style={styles.valorSaldo}>{formatarMoeda(resumo.saldoTotal)}</Text>
                        </View>

                        {/* Cards de Entradas e Saídas do Mês */}
                        <View style={styles.linhaCards}>
                            <View style={[styles.cardPequeno, styles.bordaReceita]}>
                                <View style={styles.topoCardPequeno}>
                                    <ArrowUpCircle color="#10b981" size={20} />
                                    <Text style={styles.labelPequeno}>Receitas do Mês</Text>
                                </View>
                                <Text style={styles.valorReceita}>{formatarMoeda(resumo.totalReceitas)}</Text>
                            </View>

                            <View style={[styles.cardPequeno, styles.bordaDespesa]}>
                                <View style={styles.topoCardPequeno}>
                                    <ArrowDownCircle color="#ef4444" size={20} />
                                    <Text style={styles.labelPequeno}>Despesas do Mês</Text>
                                </View>
                                <Text style={styles.valorDespesa}>{formatarMoeda(resumo.totalDespesas)}</Text>
                            </View>
                        </View>

                        {/* Card do Gráfico Donut de Despesas */}
                        {dadosGrafico.length > 0 && (
                            <View style={styles.cardGrafico}>
                                <Text style={styles.tituloGrafico}>Despesas por Categoria</Text>
                                <Text style={styles.subtituloGrafico}>Distribuição percentual deste mês</Text>

                                <View style={styles.conteudoGrafico}>
                                    <PieChart
                                        data={dadosGrafico}
                                        donut
                                        showText
                                            textColor="ffffff"
                                        textSize={11}
                                        fontWeight="bold"
                                        radius={75}
                                        innerRadius={45}
                                        innerCircleColor="#ffffff"
                                        labelsPosition="outward"
                                        centerLabelComponent={() => (
                                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 10, color: '#64748b' }}>Total</Text>
                                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#0f172a' }}>
                                                    {formatarMoeda(resumo.totalDespesas)}
                                                </Text>
                                            </View>
                                        )}
                                    />

                                    {/* Legenda */}
                                    <View style={styles.legendaGrafico}>
                                        {dadosGrafico.map((item, idx) => (
                                            <View key={idx} style={styles.itemLegenda}>
                                                <View style={[styles.pontoCorLegenda, { backgroundColor: item.color }]} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.nomeCatLegenda} numberOfLines={1}>
                                                        {item.nome}
                                                    </Text>
                                                    <Text style={styles.valorCatLegenda}>
                                                        {item.valorFormatado} ({item.text})
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Lista de Transações do Mês */}
                        <View style={styles.secao}>
                            <Text style={styles.tituloSecao}>Transações de {MESES[dataSelecionada.getMonth()]}</Text>

                            {transacoes.length === 0 ? (
                                <View style={styles.cardVazio}>
                                    <Text style={styles.textoVazio}>Nenhuma movimentação registrada neste mês.</Text>
                                </View>
                            ) : (
                                transacoes.map((item: any, index) => {
                                    const tipoItem = String(item.tipo || item.tipo_transacao || item.categoria?.tipo || '').toLowerCase();
                                    const ehReceita = tipoItem === 'receita';
                                    const chaveItem = item.id ?? item.id_transacao ?? index;
                                    const nomeCategoria = extrairNomeCategoria(item);
                                    const dataFormatada = formatarDataHora(item);
                                    const nomeCartao = extrairNomeCartao(item);

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
                                                    ) : nomeCartao ? (
                                                        <CreditCard size={18} color="#ef4444" />
                                                    ) : (
                                                        <TrendingDown size={18} color="#ef4444" />
                                                    )}
                                                </View>

                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.descricaoTransacao} numberOfLines={1}>
                                                        {item.descricao}
                                                    </Text>

                                                    <View style={styles.metaTransacao}>
                                                        <Text style={styles.categoriaTransacao}>{nomeCategoria}</Text>
                                                        {dataFormatada ? (
                                                            <Text style={styles.dataTransacao}> • {dataFormatada}</Text>
                                                        ) : null}

                                                        {/* Badge do Cartão de Crédito */}
                                                        {nomeCartao && (
                                                            <View style={styles.badgeCartao}>
                                                                <CreditCard size={10} color="#4f46e5" />
                                                                <Text style={styles.textoBadgeCartao}>{nomeCartao}</Text>
                                                            </View>
                                                        )}
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
        marginBottom: 12,
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
    containerSeletorMes: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    botaoSetaMes: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxMesTexto: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    textoMesExtenso: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
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
        fontSize: 12,
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
    cardGrafico: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
        elevation: 1,
    },
    tituloGrafico: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtituloGrafico: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 16,
        marginTop: 2,
    },
    conteudoGrafico: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 12,
    },
    legendaGrafico: {
        flex: 1,
        gap: 8,
        paddingLeft: 8,
    },
    itemLegenda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pontoCorLegenda: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    nomeCatLegenda: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
    valorCatLegenda: {
        fontSize: 11,
        color: '#64748b',
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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginRight: 10,
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
        flexWrap: 'wrap',
        gap: 4,
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
    badgeCartao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ede9fe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 4,
    },
    textoBadgeCartao: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4f46e5',
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