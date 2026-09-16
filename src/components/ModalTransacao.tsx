import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import { api } from '@/services/api'
import {
    X,
    TrendingUp,
    TrendingDown,
    Tag,
    CreditCard as CreditCardIcon,
    Wallet,
} from 'lucide-react-native';

export interface TransacaoItem {
    id?: number | string;
    id_transacao?: number | string;
    descricao: string;
    valor: number | string;
    tipo?: string;
    tipo_transacao?: string;
    id_categoria?: number;
    categoria_id?: number;
    categoria?: any;
    id_cartao?: number | null;
    cartao?: any;
}

interface Categoria {
    id: number;
    nome: string;
    tipo: string;
}

interface CartaoOption {
    id_cartao: number;
    nome: string;
}

interface ModalTransacaoProps {
    visivel: boolean;
    aoFechar: () => void;
    aoSalvarSucesso?: () => void;
    transacaoParaEditar?: TransacaoItem | null;
}

const CATEGORIAS_DEMO: Categoria[] = [
    { id: 1, nome: 'Alimentação', tipo: 'despesa' },
    { id: 2, nome: 'Salário', tipo: 'receita' },
    { id: 3, nome: 'Lazer', tipo: 'despesa' },
    { id: 4, nome: 'Educação', tipo: 'despesa' },
    { id: 5, nome: 'Investimentos', tipo: 'receita' },
    { id: 6, nome: 'Moradia', tipo: 'despesa' },
];

const CARTOES_DEMO: CartaoOption[] = [
    { id_cartao: 1, nome: 'Nubank' },
    { id_cartao: 2, nome: 'Itaú' },
];

export function ModalTransacao({ 
    visivel,
    aoFechar,
    aoSalvarSucesso,
    transacaoParaEditar,
 }: ModalTransacaoProps) {
    const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
    const [descricao, setDescricao] = useState('');
    const [valorFormatado, setValorFormatado] = useState('0,00');
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
    const [cartaoSelecionado, setCartaoSelecionado] = useState<number | null>(null);
    const [carregandoCategorias, setCarregandoCategorias] = useState(false);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [valorNumerico, setValorNumerico] = useState(0);

    // Estados de Cartão de Crédito
    const [cartoes, setCartoes] = useState<CartaoOption[]>([]);



    function preencherParaEdicao(item: TransacaoItem) {
        const tipoNorm = String(item.tipo || item.tipo_transacao || '').toLowerCase().includes('rec')
            ? 'receita'
            : 'despesa';
        setTipo(tipoNorm);
        setDescricao(item.descricao || '');

        const val = Math.abs(Number(item.valor)) || 0;
        setValorNumerico(val);
        setValorFormatado(
            val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );

        const catId = Number(item.id_categoria ?? item.categoria_id ?? item.categoria?.id);
        if (catId) {
            const encontrada = categorias.find((c) => c.id === catId);
            if (encontrada) setCategoriaSelecionada(encontrada);
        }

        const cardId = item.id_cartao ? Number(item.id_cartao) : null;
        setCartaoSelecionado(cardId);
    }

    function handleValorChange(texto: string) {
        const apenasDigitos = texto.replace(/\D/g, '');
        if (!apenasDigitos || apenasDigitos === '0') {
            setValorFormatado('0,00');
            return;
        }

        const centavos = parseInt(apenasDigitos.slice(0, 10), 10);
        const real = centavos / 100;
        setValorFormatado(
            real.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
    }

    function handleFechar() {
        setDescricao('');
        setValorFormatado('0,00');
        setCategoriaSelecionada(null);
        setCartaoSelecionado(null);
        setTipo('receita');
        aoFechar();
    }

    const categoriasFiltradas = CATEGORIAS_DEMO.filter((c) =>
        c.tipo.includes(tipo.substring(0, 3))
    );

    async function buscarCategorias() {
        try {
            setCarregandoCategorias(true);
            const res = await api.get('/categorias');
            const listaBruta = res.data?.categorias || res.data || [];

            if (Array.isArray(listaBruta)) {
                const norm: Categoria[] = listaBruta.map((cat: any) => ({
                    id: Number(cat.id ?? cat.id_categoria),
                    nome: cat.nome || cat.descricao || 'Sem nome',
                    tipo: String(cat.tipo || '').toLowerCase(),
                }));
                setCategorias(norm);
            }
        } catch (error: any) {
            console.error('Erro ao buscar categorias:', error.response?.data || error.message);
        } finally {
            setCarregandoCategorias(false);
        }
    }

    async function buscarCartoes() {
        try {
            const res = await api.get('/cartoes');
            const lista = res.data?.cartoes || res.data || [];
            if (Array.isArray(lista)) {
                setCartoes(lista);
            }
        } catch (error: any) {
            console.error('Erro ao buscar cartões:', error.response?.data || error.message);
        }
    }

    return (
        <Modal visible={visivel} transparent animationType="slide" onRequestClose={handleFechar}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.containerModal}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                            {/* Topo */}
                            <View style={styles.topoModal}>
                                <Text style={styles.tituloModal}>Nova Transação</Text>
                                <TouchableOpacity onPress={handleFechar}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {/* Seletor Tipo (Receita / Despesa) */}
                            <View style={styles.containerTipo}>
                                <TouchableOpacity
                                    style={[styles.botaoTipo, tipo === 'receita' && styles.botaoTipoReceitaAtivo]}
                                    onPress={() => {
                                        setTipo('receita');
                                        setCartaoSelecionado(null);
                                    }}
                                >
                                    <TrendingUp size={18} color={tipo === 'receita' ? '#ffffff' : '#10b981'} />
                                    <Text style={[styles.textoTipo, tipo === 'receita' && styles.textoTipoAtivo]}>
                                        Receita
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.botaoTipo, tipo === 'despesa' && styles.botaoTipoDespesaAtivo]}
                                    onPress={() => setTipo('despesa')}
                                >
                                    <TrendingDown size={18} color={tipo === 'despesa' ? '#ffffff' : '#ef4444'} />
                                    <Text style={[styles.textoTipo, tipo === 'despesa' && styles.textoTipoAtivo]}>
                                        Despesa
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Campo Valor */}
                            <Text style={styles.label}>Valor (R$)</Text>
                            <View style={styles.inputValorContainer}>
                                <Text style={styles.simboloMoeda}>R$</Text>
                                <TextInput
                                    style={styles.inputValorTexto}
                                    value={valorFormatado}
                                    onChangeText={handleValorChange}
                                    keyboardType="number-pad"
                                />
                            </View>

                            {/* Campo Descrição */}
                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Aluguel, Supermercado, Salário"
                                placeholderTextColor="#94a3b8"
                                value={descricao}
                                onChangeText={setDescricao}
                            />

                            {/* Forma de Pagamento (somente em Despesa) */}
                            {tipo === 'despesa' && (
                                <View style={styles.secaoPagamento}>
                                    <Text style={styles.label}>Forma de Pagamento</Text>
                                    <View style={styles.gradePagamento}>
                                        <TouchableOpacity
                                            style={[
                                                styles.chipPagamento,
                                                cartaoSelecionado === null && styles.chipPagamentoAtivo,
                                            ]}
                                            onPress={() => setCartaoSelecionado(null)}
                                        >
                                            <Wallet
                                                size={14}
                                                color={cartaoSelecionado === null ? '#ffffff' : '#475569'}
                                            />
                                            <Text
                                                style={[
                                                    styles.textoChipPagamento,
                                                    cartaoSelecionado === null && styles.textoChipPagamentoAtivo,
                                                ]}
                                            >
                                                Conta / Dinheiro
                                            </Text>
                                        </TouchableOpacity>

                                        {CARTOES_DEMO.map((c) => {
                                            const ativo = cartaoSelecionado === c.id_cartao;
                                            return (
                                                <TouchableOpacity
                                                    key={c.id_cartao}
                                                    style={[styles.chipPagamento, ativo && styles.chipPagamentoAtivo]}
                                                    onPress={() => setCartaoSelecionado(c.id_cartao)}
                                                >
                                                    <CreditCardIcon
                                                        size={14}
                                                        color={ativo ? '#ffffff' : '#475569'}
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.textoChipPagamento,
                                                            ativo && styles.textoChipPagamentoAtivo,
                                                        ]}
                                                    >
                                                        {c.nome}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}

                            {/* Categorias */}
                            <Text style={styles.label}>Categoria</Text>
                            <View style={styles.gradeCategorias}>
                                {categoriasFiltradas.map((cat) => {
                                    const ativa = categoriaSelecionada === cat.id;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.chip,
                                                ativa && (tipo === 'receita' ? styles.chipReceitaAtivo : styles.chipDespesaAtivo),
                                            ]}
                                            onPress={() => setCategoriaSelecionada(cat.id)}
                                        >
                                            <Tag size={13} color={ativa ? '#ffffff' : '#64748b'} />
                                            <Text style={[styles.textoChip, ativa && styles.textoChipAtivo]}>
                                                {cat.nome}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Botão Salvar (Apenas visual - fecha o modal) */}
                            <TouchableOpacity
                                style={[styles.botaoSalvar, tipo === 'receita' ? styles.bgReceita : styles.bgDespesa]}
                                onPress={handleFechar}
                            >
                                <Text style={styles.textoBotaoSalvar}>Confirmar Transação</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    containerModal: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    topoModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    tituloModal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    containerTipo: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    botaoTipo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    botaoTipoReceitaAtivo: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    botaoTipoDespesaAtivo: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    textoTipo: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    textoTipoAtivo: {
        color: '#ffffff',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 6,
    },
    inputValorContainer: {
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
    simboloMoeda: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#64748b',
        marginRight: 8,
    },
    inputValorTexto: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
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
    secaoPagamento: {
        marginBottom: 14,
    },
    gradePagamento: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chipPagamento: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#f8fafc',
    },
    chipPagamentoAtivo: {
        backgroundColor: '#1e1b4b',
        borderColor: '#1e1b4b',
    },
    textoChipPagamento: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    textoChipPagamentoAtivo: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    gradeCategorias: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    chipReceitaAtivo: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    chipDespesaAtivo: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    textoChip: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    textoChipAtivo: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    botaoSalvar: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    bgReceita: {
        backgroundColor: '#10b981',
    },
    bgDespesa: {
        backgroundColor: '#ef4444',
    },
    textoBotaoSalvar: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});