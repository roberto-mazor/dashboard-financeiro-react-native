import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    RefreshControl,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import {
    CreditCard,
    Plus,
    Trash2,
    Calendar,
    ShieldCheck,
    X,
} from 'lucide-react-native';

interface CartaoItem {
    id_cartao: number;
    nome: string;
    bandeira: string;
    limite_total: number | string;
    limite_disponivel: number | string;
    dia_fechamento: number | string;
    dia_vencimento: number | string;
}

const BANDEIRAS = ['Mastercard', 'Visa', 'Elo', 'Hipercard', 'Amex'];

export default function CartoesScreen() {
    const [cartoes, setCartoes] = useState<CartaoItem[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);

    // Estados do Modal
    const [modalAberto, setModalAberto] = useState(false);
    const [nomeCartao, setNomeCartao] = useState('');
    const [bandeiraSelecionada, setBandeiraSelecionada] = useState('Mastercard');
    const [limiteFormatado, setLimiteFormatado] = useState('0,00');
    const [limiteNumerico, setLimiteNumerico] = useState(0);
    const [diaFechamento, setDiaFechamento] = useState('05');
    const [diaVencimento, setDiaVencimento] = useState('15');
    const [salvando, setSalvando] = useState(false);

    function formatarMoeda(valor: number | string) {
        const numero = Number(valor) || 0;
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }

    function handleLimiteChange(texto: string) {
        const apenasDigitos = texto.replace(/\D/g, '');
        if (!apenasDigitos || apenasDigitos === '0') {
            setLimiteFormatado('0,00');
            setLimiteNumerico(0);
            return;
        }

        const centavos = parseInt(apenasDigitos.slice(0, 10), 10);
        const real = centavos / 100;
        setLimiteNumerico(real);
        setLimiteFormatado(
            real.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
    }

    async function carregarCartoes() {
        try {
            const res = await api.get('/cartoes');
            const lista: CartaoItem[] = res.data?.cartoes || res.data || [];
            if (Array.isArray(lista)) {
                setCartoes(lista);
            }
        } catch (error: any) {
            console.error('Erro ao buscar cartões:', error.response?.data || error.message);
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarCartoes();
        }, [])
    );

    async function handleSalvarCartao() {
        if (!nomeCartao.trim()) {
            Alert.alert('Atenção', 'Digite o nome do cartão.');
            return;
        }

        if (limiteNumerico <= 0) {
            Alert.alert('Atenção', 'Informe um limite total válido.');
            return;
        }

        const fechamento = parseInt(diaFechamento, 10);
        const vencimento = parseInt(diaVencimento, 10);

        if (isNaN(fechamento) || fechamento < 1 || fechamento > 31) {
            Alert.alert('Atenção', 'Dia de fechamento inválido (deve ser entre 1 e 31).');
            return;
        }

        if (isNaN(vencimento) || vencimento < 1 || vencimento > 31) {
            Alert.alert('Atenção', 'Dia de vencimento inválido (deve ser entre 1 e 31).');
            return;
        }

        try {
            setSalvando(true);
            await api.post('/cartoes', {
                nome: nomeCartao.trim(),
                bandeira: bandeiraSelecionada,
                limite_total: limiteNumerico,
                dia_fechamento: fechamento,
                dia_vencimento: vencimento,
            });

            Alert.alert('Sucesso', 'Cartão cadastrado com sucesso!');
            setNomeCartao('');
            setBandeiraSelecionada('Mastercard');
            setLimiteFormatado('0,00');
            setLimiteNumerico(0);
            setDiaFechamento('05');
            setDiaVencimento('15');
            setModalAberto(false);
            carregarCartoes();
        } catch (error: any) {
            const msg = error.response?.data?.error || error.response?.data?.message || 'Erro ao cadastrar cartão.';
            Alert.alert('Erro', msg);
        } finally {
            setSalvando(false);
        }
    }

    function handleExcluir(cartao: CartaoItem) {
        Alert.alert(
            'Remover Cartão',
            `Tem certeza que deseja apagar o cartão "${cartao.nome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/cartoes/${cartao.id_cartao}`);
                            setCartoes((prev) => prev.filter((c) => c.id_cartao !== cartao.id_cartao));
                            Alert.alert('Sucesso', 'Cartão removido.');
                        } catch (error: any) {
                            const msg = error.response?.data?.error || 'Erro ao excluir o cartão.';
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
                            <CreditCard size={48} color="#cbd5e1" />
                            <Text style={styles.textoVazio}>Nenhum cartão cadastrado.</Text>
                            <Text style={styles.subtextoVazio}>
                                Toque no botão abaixo para cadastrar seu primeiro cartão.
                            </Text>
                            <TouchableOpacity
                                style={styles.botaoAdicionarVazio}
                                onPress={() => setModalAberto(true)}
                            >
                                <Plus size={18} color="#ffffff" />
                                <Text style={styles.textoBotaoAdicionarVazio}>Cadastrar Cartão</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        cartoes.map((cartao) => {
                            const limiteTotal = Number(cartao.limite_total) || 0;
                            const limiteDisp = Number(cartao.limite_disponivel) || 0;
                            // Fatura atual é a diferença gasta
                            const faturaAtual = Math.max(limiteTotal - limiteDisp, 0);

                            const percentualUso = limiteTotal > 0
                                ? Math.min(Math.round((faturaAtual / limiteTotal) * 100), 100)
                                : 0;

                            return (
                                <View key={cartao.id_cartao} style={styles.cartaoContainer}>
                                    {/* Cartão Físico Estilizado */}
                                    <View style={styles.cartaoFisico}>
                                        <View style={styles.cartaoTopo}>
                                            <Text style={styles.nomeCartaoTopo}>{cartao.nome}</Text>
                                            <Text style={styles.bandeiraBadge}>{cartao.bandeira}</Text>
                                        </View>

                                        <View style={styles.chipFisico} />

                                        <Text style={styles.numeroMascara}>•••• •••• •••• 4242</Text>

                                        <View style={styles.cartaoRodape}>
                                            <View>
                                                <Text style={styles.cartaoLabelPequena}>LIMITE TOTAL</Text>
                                                <Text style={styles.cartaoValorPequeno}>
                                                    {formatarMoeda(limiteTotal)}
                                                </Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={styles.cartaoLabelPequena}>FECHAMENTO / VENCIMENTO</Text>
                                                <Text style={styles.cartaoValorPequeno}>
                                                    Dia {cartao.dia_fechamento} / {cartao.dia_vencimento}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Painel de Fatura e Limite */}
                                    <View style={styles.painelDetalhes}>
                                        <View style={styles.linhaFatura}>
                                            <View>
                                                <Text style={styles.labelFatura}>Fatura Atual</Text>
                                                <Text style={styles.valorFatura}>{formatarMoeda(faturaAtual)}</Text>
                                            </View>

                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={styles.labelFatura}>Disponível</Text>
                                                <Text style={styles.valorDisponivel}>{formatarMoeda(limiteDisp)}</Text>
                                            </View>
                                        </View>

                                        {/* Barra de Progresso */}
                                        <View style={styles.barraFundo}>
                                            <View
                                                style={[
                                                    styles.barraProgresso,
                                                    {
                                                        width: `${percentualUso}%`,
                                                        backgroundColor:
                                                            percentualUso > 80
                                                                ? '#ef4444'
                                                                : percentualUso > 50
                                                                    ? '#f59e0b'
                                                                    : '#10b981',
                                                    },
                                                ]}
                                            />
                                        </View>

                                        <View style={styles.rodapeAcoes}>
                                            <View style={styles.datasInfo}>
                                                <Calendar size={14} color="#64748b" />
                                                <Text style={styles.textoDatasInfo}>
                                                    Fecha dia {cartao.dia_fechamento} • Vence dia {cartao.dia_vencimento}
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                style={styles.botaoRemover}
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

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalAberto(true)}
                activeOpacity={0.85}
            >
                <Plus color="#ffffff" size={28} />
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={modalAberto} transparent animationType="slide" onRequestClose={() => setModalAberto(false)}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={styles.modalContainer}
                        >
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalTopo}>
                                    <Text style={styles.modalTitulo}>Novo Cartão de Crédito</Text>
                                    <TouchableOpacity onPress={() => setModalAberto(false)} disabled={salvando}>
                                        <X size={24} color="#64748b" />
                                    </TouchableOpacity>
                                </View>

                                {/* Nome */}
                                <Text style={styles.labelInput}>Identificação / Nome *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Nubank Roxinho, C6 Carbon"
                                    placeholderTextColor="#94a3b8"
                                    value={nomeCartao}
                                    onChangeText={setNomeCartao}
                                />

                                {/* Bandeira */}
                                <Text style={styles.labelInput}>Bandeira *</Text>
                                <View style={styles.bandeirasRow}>
                                    {BANDEIRAS.map((b) => (
                                        <TouchableOpacity
                                            key={b}
                                            style={[
                                                styles.chipBandeira,
                                                bandeiraSelecionada === b && styles.chipBandeiraAtivo,
                                            ]}
                                            onPress={() => setBandeiraSelecionada(b)}
                                        >
                                            <Text
                                                style={[
                                                    styles.textoBandeira,
                                                    bandeiraSelecionada === b && styles.textoBandeiraAtivo,
                                                ]}
                                            >
                                                {b}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Limite Total */}
                                <Text style={styles.labelInput}>Limite Total (R$) *</Text>
                                <View style={styles.boxValor}>
                                    <Text style={styles.moeda}>R$</Text>
                                    <TextInput
                                        style={styles.inputValor}
                                        value={limiteFormatado}
                                        onChangeText={handleLimiteChange}
                                        keyboardType="number-pad"
                                    />
                                </View>

                                {/* Dias */}
                                <View style={styles.linhaDatas}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.labelInput}>Dia Fechamento *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="05"
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={diaFechamento}
                                            onChangeText={setDiaFechamento}
                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.labelInput}>Dia Vencimento *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="15"
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={diaVencimento}
                                            onChangeText={setDiaVencimento}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.botaoConfirmar}
                                    onPress={handleSalvarCartao}
                                    disabled={salvando}
                                >
                                    {salvando ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Text style={styles.textoBotaoConfirmar}>Cadastrar Cartão</Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
        padding: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        marginTop: 40,
    },
    textoVazio: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 12,
    },
    subtextoVazio: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 20,
    },
    botaoAdicionarVazio: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#4f46e5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    textoBotaoAdicionarVazio: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cartaoContainer: {
        marginBottom: 20,
    },
    cartaoFisico: {
        backgroundColor: '#1e1b4b',
        borderRadius: 18,
        padding: 22,
        elevation: 4,
        shadowColor: '#1e1b4b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cartaoTopo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    nomeCartaoTopo: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    bandeiraBadge: {
        color: '#93c5fd',
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    chipFisico: {
        width: 38,
        height: 28,
        backgroundColor: '#fbbf24',
        borderRadius: 6,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#d97706',
    },
    numeroMascara: {
        color: '#cbd5e1',
        fontSize: 16,
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 18,
    },
    cartaoRodape: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cartaoLabelPequena: {
        color: '#94a3b8',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    cartaoValorPequeno: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 2,
    },
    painelDetalhes: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#e2e8f0',
        elevation: 1,
    },
    linhaFatura: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    labelFatura: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    valorFatura: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 2,
    },
    valorDisponivel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
        marginTop: 2,
    },
    barraFundo: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    barraProgresso: {
        height: '100%',
        borderRadius: 4,
    },
    rodapeAcoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 4,
    },
    datasInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    textoDatasInfo: {
        fontSize: 12,
        color: '#64748b',
    },
    botaoRemover: {
        padding: 4,
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
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalTopo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    labelInput: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#0f172a',
        marginBottom: 14,
    },
    bandeirasRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    chipBandeira: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#f8fafc',
    },
    chipBandeiraAtivo: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    textoBandeira: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    textoBandeiraAtivo: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    boxValor: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 14,
    },
    moeda: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#64748b',
        marginRight: 8,
    },
    inputValor: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    linhaDatas: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10,
    },
    botaoConfirmar: {
        backgroundColor: '#4f46e5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    textoBotaoConfirmar: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});