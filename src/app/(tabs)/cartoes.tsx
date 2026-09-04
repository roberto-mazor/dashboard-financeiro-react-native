import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import {
    CreditCard as CreditCardIcon,
    Trash2,
    Plus,
    Calendar,
    CheckCircle2,
} from 'lucide-react-native';
import { ModalNovoCartao } from '@/components/ModalNovoCartao';

interface CartaoItem {
    id_cartao: number;
    nome: string;
    bandeira: string;
    limite_total: number | string;
    limite_disponivel: number | string;
    dia_fechamento: number;
    dia_vencimento: number;
}

export default function CartoesScreen() {
    const [cartoes, setCartoes] = useState<CartaoItem[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [pagandoId, setPagandoId] = useState<number | null>(null);

    function formatarMoeda(valor: number | string) {
        const numero = Number(valor) || 0;
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }

    const carregarCartoes = useCallback(async () => {
        try {
            const res = await api.get('/cartoes');
            const lista = res.data?.cartoes || res.data || [];
            if (Array.isArray(lista)) {
                setCartoes(lista);
            }
        } catch (error: any) {
            console.error('Erro ao carregar cartões:', error.response?.data || error.message);
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            carregarCartoes();
        }, [carregarCartoes])
    );

    function handlePagarFatura(cartao: CartaoItem) {
        const total = parseFloat(String(cartao.limite_total)) || 0;
        const disp = parseFloat(String(cartao.limite_disponivel)) || 0;
        const fatura = Math.max(0, total - disp);

        if (fatura <= 0) {
            Alert.alert('Fatura Zerada', 'Este cartão não possui fatura em aberto para pagar.');
            return;
        }

        Alert.alert(
            'Confirmar Pagamento',
            `Deseja pagar a fatura de ${formatarMoeda(fatura)} do cartão "${cartao.nome}"? O limite total será restabelecido e o valor será debitado do seu saldo.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar Pagamento',
                    onPress: async () => {
                        try {
                            setPagandoId(cartao.id_cartao);
                            await api.post(`/cartoes/${cartao.id_cartao}/pagar-fatura`);
                            Alert.alert('Sucesso', 'Fatura paga e limite restabelecido com sucesso!');
                            carregarCartoes();
                        } catch (error: any) {
                            const msg = error.response?.data?.error || 'Erro ao processar pagamento.';
                            Alert.alert('Erro', msg);
                        } finally {
                            setPagandoId(null);
                        }
                    },
                },
            ]
        );
    }

    function handleExcluir(cartao: CartaoItem) {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente remover o cartão "${cartao.nome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/cartoes/${cartao.id_cartao}`);
                            setCartoes((prev) => prev.filter((c) => c.id_cartao !== cartao.id_cartao));
                            Alert.alert('Sucesso', 'Cartão excluído!');
                        } catch (error: any) {
                            const msg = error.response?.data?.error || 'Erro ao excluir cartão.';
                            Alert.alert('Erro', msg);
                        }
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Meus Cartões</Text>
                <Text style={styles.subtitulo}>Gestão de limites, faturas e vencimentos</Text>
            </View>

            {carregando ? (
                <View style={styles.centroLoading}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    refreshControl={
                        <RefreshControl
                            refreshing={atualizando}
                            onRefresh={() => {
                                setAtualizando(true);
                                carregarCartoes();
                            }}
                            colors={['#4f46e5']}
                        />
                    }
                >
                    {cartoes.length === 0 ? (
                        <View style={styles.cardVazio}>
                            <CreditCardIcon size={44} color="#94a3b8" />
                            <Text style={styles.textoVazio}>Você ainda não cadastrou nenhum cartão.</Text>
                        </View>
                    ) : (
                        cartoes.map((cartao) => {
                            const limiteTotal = parseFloat(String(cartao.limite_total)) || 0;
                            const limiteDisponivel = parseFloat(String(cartao.limite_disponivel)) || 0;
                            const faturaAtual = Math.max(0, limiteTotal - limiteDisponivel);
                            const porcentagemGasta = limiteTotal > 0 ? (faturaAtual / limiteTotal) * 100 : 0;
                            const isPagando = pagandoId === cartao.id_cartao;

                            return (
                                <View key={cartao.id_cartao} style={styles.wrapperCartao}>
                                    {/* Cartão Físico Estilizado */}
                                    <View style={styles.cartaoVisual}>
                                        <View style={styles.cartaoTopo}>
                                            <Text style={styles.nomeCartao}>{cartao.nome}</Text>
                                            <Text style={styles.bandeiraCartao}>{cartao.bandeira.toUpperCase()}</Text>
                                        </View>

                                        <View style={styles.chipFisico} />

                                        <Text style={styles.numeroMascara}>••••  ••••  ••••  4242</Text>

                                        <View style={styles.cartaoRodape}>
                                            <View>
                                                <Text style={styles.cartaoRodapeLabel}>LIMITE TOTAL</Text>
                                                <Text style={styles.cartaoRodapeValor}>{formatarMoeda(limiteTotal)}</Text>
                                            </View>

                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={styles.cartaoRodapeLabel}>FECHAMENTO / VENCIMENTO</Text>
                                                <Text style={styles.cartaoRodapeValor}>
                                                    Dia {cartao.dia_fechamento} / {cartao.dia_vencimento}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Painel de Gestão de Fatura & Limites */}
                                    <View style={styles.painelGestao}>
                                        <View style={styles.linhaMetricas}>
                                            <View>
                                                <Text style={styles.metricaLabel}>Fatura Atual</Text>
                                                <Text style={[styles.metricaValor, faturaAtual > 0 ? styles.textoFaturaAberta : styles.textoFaturaZerada]}>
                                                    {formatarMoeda(faturaAtual)}
                                                </Text>
                                            </View>

                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={styles.metricaLabel}>Disponível</Text>
                                                <Text style={styles.metricaValorDisponivel}>
                                                    {formatarMoeda(limiteDisponivel)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Barra de Progresso do Limite Consumido */}
                                        <View style={styles.barraFundo}>
                                            <View
                                                style={[
                                                    styles.barraPreenchida,
                                                    {
                                                        width: `${Math.min(100, Math.max(0, porcentagemGasta))}%`,
                                                        backgroundColor: porcentagemGasta > 80 ? '#ef4444' : '#4f46e5',
                                                    },
                                                ]}
                                            />
                                        </View>

                                        {/* Botão de Pagar Fatura (exibido apenas se houver fatura aberta) */}
                                        {faturaAtual > 0 && (
                                            <TouchableOpacity
                                                style={styles.botaoPagarFatura}
                                                onPress={() => handlePagarFatura(cartao)}
                                                disabled={isPagando}
                                            >
                                                {isPagando ? (
                                                    <ActivityIndicator size="small" color="#ffffff" />
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={16} color="#ffffff" />
                                                        <Text style={styles.textoBotaoPagar}>Pagar Fatura ({formatarMoeda(faturaAtual)})</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        )}

                                        <View style={styles.linhaInfoAcoes}>
                                            <View style={styles.boxVencimento}>
                                                <Calendar size={14} color="#64748b" />
                                                <Text style={styles.textoVencimento}>
                                                    Fecha dia {cartao.dia_fechamento} • Vence dia {cartao.dia_vencimento}
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => handleExcluir(cartao)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <Trash2 size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* FAB para Adicionar Cartão */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalAberto(true)}
                activeOpacity={0.85}
            >
                <Plus color="#ffffff" size={28} />
            </TouchableOpacity>

            {/* Modal para cadastrar novo cartão se você já possuir */}
            {ModalNovoCartao && (
                <ModalNovoCartao
                    visivel={modalAberto}
                    aoFechar={() => setModalAberto(false)}
                    aoSalvarSucesso={carregarCartoes}
                />
            )}
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
        paddingBottom: 14,
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
    centroLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    cardVazio: {
        backgroundColor: '#ffffff',
        padding: 36,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        gap: 12,
    },
    textoVazio: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
    wrapperCartao: {
        marginBottom: 22,
    },
    cartaoVisual: {
        backgroundColor: '#1b1b3a',
        borderRadius: 20,
        padding: 22,
        shadowColor: '#1e1b4b',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
        zIndex: 2,
    },
    cartaoTopo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    nomeCartao: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bandeiraCartao: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    chipFisico: {
        width: 36,
        height: 26,
        backgroundColor: '#eab308',
        borderRadius: 6,
        marginBottom: 18,
    },
    numeroMascara: {
        color: '#ffffff',
        fontSize: 17,
        letterSpacing: 3,
        fontWeight: '500',
        marginBottom: 20,
    },
    cartaoRodape: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cartaoRodapeLabel: {
        color: '#94a3b8',
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    cartaoRodapeValor: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 2,
    },
    painelGestao: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: -10,
        zIndex: 1,
    },
    linhaMetricas: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    metricaLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    metricaValor: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 2,
    },
    textoFaturaAberta: {
        color: '#ef4444',
    },
    textoFaturaZerada: {
        color: '#0f172a',
    },
    metricaValorDisponivel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
        marginTop: 2,
    },
    barraFundo: {
        height: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 14,
    },
    barraPreenchida: {
        height: '100%',
        borderRadius: 3,
    },
    botaoPagarFatura: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10b981',
        borderRadius: 10,
        paddingVertical: 10,
        marginBottom: 12,
    },
    textoBotaoPagar: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    linhaInfoAcoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 4,
    },
    boxVencimento: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    textoVencimento: {
        fontSize: 12,
        color: '#64748b',
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