import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import {
    Search,
    TrendingUp,
    TrendingDown,
    Trash2,
    Edit2,
    Plus,
    ArrowUpDown,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from 'lucide-react-native';
import { ModalTransacao, TransacaoItem } from '@/components/ModalTransacao';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function TransacoesScreen() {
    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [transacoes, setTransacoes] = useState<TransacaoItem[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<'todas' | 'receita' | 'despesa'>('todas');

    const [modalAberto, setModalAberto] = useState(false);
    const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoItem | null>(null);

    function formatarMoeda(valor: number | string) {
        const numero = Math.abs(Number(valor)) || 0;
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }

    function extrairTipoNormalizado(item: TransacaoItem): 'receita' | 'despesa' {
        const raw = String(item.tipo || item.tipo_transacao || item.categoria?.tipo || '').toLowerCase();
        return raw.includes('rec') ? 'receita' : 'despesa';
    }

    function formatarDataHora(item: any): string {
        const raw = item.data || item.data_transacao || item.created_at || item.criado_em;
        if (!raw) return '';

        try {
            const partes = String(raw).split('T')[0].split('-');
            if (partes.length === 3) {
                return `${partes[2]}/${partes[1]}`;
            }

            const dataObj = new Date(raw);
            if (isNaN(dataObj.getTime())) return '';
            return dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        } catch {
            return '';
        }
    }

    function extrairNomeCategoria(item: any): string {
        if (typeof item.categoria === 'string' && item.categoria.trim()) return item.categoria;
        if (typeof item.categoria === 'object' && item.categoria?.nome) return item.categoria.nome;
        return extrairTipoNormalizado(item) === 'receita' ? 'Receita' : 'Despesa';
    }

    function extrairNomeCartao(item: any): string | null {
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

    const carregarTransacoes = useCallback(async () => {
        try {
            const { primeiroDia, ultimoDia } = obterIntervaloMes(dataSelecionada);

            const params: any = {};
            // Se não houver busca em digitação, restringe ao mês selecionado
            if (!busca.trim()) {
                params.data_inicio = primeiroDia;
                params.data_fim = ultimoDia;
            } else {
                params.busca = busca.trim();
            }

            const res = await api.get('/transacoes', { params });
            const lista: TransacaoItem[] = res.data?.transacoes || res.data || [];

            if (Array.isArray(lista)) {
                const ordenadas = [...lista].sort((a: any, b: any) => {
                    const dataA = new Date(a.data || a.data_transacao || a.created_at || 0).getTime();
                    const dataB = new Date(b.data || b.data_transacao || b.created_at || 0).getTime();
                    if (dataB !== dataA) return dataB - dataA;

                    const idA = Number(a.id ?? a.id_transacao ?? 0);
                    const idB = Number(b.id ?? b.id_transacao ?? 0);
                    return idB - idA;
                });
                setTransacoes(ordenadas);
            }
        } catch (error: any) {
            console.error('Erro ao listar transações:', error.response?.data || error.message);
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    }, [dataSelecionada, busca]);

    useFocusEffect(
        useCallback(() => {
            carregarTransacoes();
        }, [carregarTransacoes])
    );

    function abrirEdicao(item: TransacaoItem) {
        setTransacaoSelecionada(item);
        setModalAberto(true);
    }

    function abrirCriacao() {
        setTransacaoSelecionada(null);
        setModalAberto(true);
    }

    function handleExcluir(item: TransacaoItem) {
        const idTransacao = item.id ?? item.id_transacao;

        Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente apagar a transação "${item.descricao}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/transacoes/${idTransacao}`);
                            setTransacoes((prev) =>
                                prev.filter((t) => (t.id ?? t.id_transacao) !== idTransacao)
                            );
                            Alert.alert('Sucesso', 'Transação excluída!');
                        } catch (error: any) {
                            const msg = error.response?.data?.error || 'Não foi possível excluir a transação.';
                            Alert.alert('Erro', msg);
                        }
                    },
                },
            ]
        );
    }

    const transacoesFiltradas = transacoes.filter((item) => {
        const tipoItem = extrairTipoNormalizado(item);
        return filtroTipo === 'todas' || tipoItem === filtroTipo;
    });

    const mesExtenso = `${MESES[dataSelecionada.getMonth()]} de ${dataSelecionada.getFullYear()}`;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Extrato de Transações</Text>
                <Text style={styles.subtitulo}>Histórico completo de entradas e saídas</Text>
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

            {/* Caixa de Busca */}
            <View style={styles.boxBusca}>
                <Search size={18} color="#94a3b8" />
                <TextInput
                    style={styles.inputBusca}
                    placeholder="Buscar global por nome, categoria..."
                    placeholderTextColor="#94a3b8"
                    value={busca}
                    onChangeText={setBusca}
                    clearButtonMode="while-editing"
                />
            </View>

            {/* Filtro por Abas */}
            <View style={styles.abasContainer}>
                <TouchableOpacity
                    style={[styles.aba, filtroTipo === 'todas' && styles.abaAtiva]}
                    onPress={() => setFiltroTipo('todas')}
                >
                    <ArrowUpDown size={14} color={filtroTipo === 'todas' ? '#ffffff' : '#64748b'} />
                    <Text style={[styles.textoAba, filtroTipo === 'todas' && styles.textoAbaAtiva]}>
                        Todas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.aba, filtroTipo === 'receita' && styles.abaReceitaAtiva]}
                    onPress={() => setFiltroTipo('receita')}
                >
                    <TrendingUp size={14} color={filtroTipo === 'receita' ? '#ffffff' : '#10b981'} />
                    <Text style={[styles.textoAba, filtroTipo === 'receita' && styles.textoAbaAtiva]}>
                        Receitas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.aba, filtroTipo === 'despesa' && styles.abaDespesaAtiva]}
                    onPress={() => setFiltroTipo('despesa')}
                >
                    <TrendingDown size={14} color={filtroTipo === 'despesa' ? '#ffffff' : '#ef4444'} />
                    <Text style={[styles.textoAba, filtroTipo === 'despesa' && styles.textoAbaAtiva]}>
                        Despesas
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Lista */}
            {carregando ? (
                <View style={styles.centroLoading}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={transacoesFiltradas}
                    keyExtractor={(item, idx) => String(item.id ?? item.id_transacao ?? idx)}
                    contentContainerStyle={styles.listaConteudo}
                    refreshControl={
                        <RefreshControl
                            refreshing={atualizando}
                            onRefresh={() => {
                                setAtualizando(true);
                                carregarTransacoes();
                            }}
                            colors={['#4f46e5']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.cardVazio}>
                            <Text style={styles.textoVazio}>
                                {busca ? 'Nenhum resultado para a busca.' : `Nenhuma transação em ${MESES[dataSelecionada.getMonth()]}.`}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const ehReceita = extrairTipoNormalizado(item) === 'receita';
                        const nomeCat = extrairNomeCategoria(item);
                        const dataFmt = formatarDataHora(item);
                        const nomeCartao = extrairNomeCartao(item);

                        return (
                            <View style={styles.cardItem}>
                                <View style={styles.itemEsquerda}>
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

                                    <View style={styles.infoTransacao}>
                                        <Text style={styles.descricaoTransacao} numberOfLines={1}>
                                            {item.descricao}
                                        </Text>

                                        <View style={styles.metaTransacao}>
                                            <Text style={styles.categoriaTransacao}>{nomeCat}</Text>
                                            {dataFmt ? <Text style={styles.dataTransacao}> • {dataFmt}</Text> : null}

                                            {/* BADGE DE CARTÃO */}
                                            {nomeCartao && (
                                                <View style={styles.badgeCartao}>
                                                    <CreditCard size={10} color="#4f46e5" />
                                                    <Text style={styles.textoBadgeCartao}>{nomeCartao}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.itemDireita}>
                                    <Text
                                        style={[
                                            styles.valorTransacao,
                                            ehReceita ? styles.textoVerde : styles.textoVermelho,
                                        ]}
                                    >
                                        {ehReceita ? '+ ' : '- '}
                                        {formatarMoeda(item.valor)}
                                    </Text>

                                    {/* Ações */}
                                    <View style={styles.acoesContainer}>
                                        <TouchableOpacity
                                            style={styles.botaoAcao}
                                            onPress={() => abrirEdicao(item)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Edit2 size={15} color="#94a3b8" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.botaoAcao}
                                            onPress={() => handleExcluir(item)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Trash2 size={15} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={abrirCriacao} activeOpacity={0.85}>
                <Plus color="#ffffff" size={28} />
            </TouchableOpacity>

            <ModalTransacao
                visivel={modalAberto}
                aoFechar={() => {
                    setModalAberto(false);
                    setTransacaoSelecionada(null);
                }}
                aoSalvarSucesso={carregarTransacoes}
                transacaoParaEditar={transacaoSelecionada}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8ff',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitulo: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    containerSeletorMes: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 20,
        marginBottom: 12,
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
    boxBusca: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginHorizontal: 20,
        marginBottom: 12,
        gap: 8,
    },
    inputBusca: {
        flex: 1,
        fontSize: 14,
        color: '#0f172a',
    },
    abasContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    aba: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#ffffff',
    },
    abaAtiva: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    abaReceitaAtiva: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    abaDespesaAtiva: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    textoAba: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    textoAbaAtiva: {
        color: '#ffffff',
    },
    centroLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listaConteudo: {
        paddingHorizontal: 20,
        paddingBottom: 90,
    },
    cardItem: {
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
    itemEsquerda: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginRight: 8,
    },
    iconeTipo: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgReceitaIcone: {
        backgroundColor: '#dcfce7',
    },
    bgDespesaIcone: {
        backgroundColor: '#fee2e2',
    },
    infoTransacao: {
        flex: 1,
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
    itemDireita: {
        alignItems: 'flex-end',
        gap: 6,
        marginLeft: 8,
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
    acoesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    botaoAcao: {
        padding: 2,
    },
    cardVazio: {
        backgroundColor: '#ffffff',
        padding: 28,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        marginTop: 20,
    },
    textoVazio: {
        color: '#94a3b8',
        fontSize: 14,
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