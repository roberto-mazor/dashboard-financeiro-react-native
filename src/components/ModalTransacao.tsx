import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import {
    X,
    TrendingUp,
    TrendingDown,
    Tag,
    Plus,
    Check,
    Edit2,
    Trash2,
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
    id?: number;
    nome: string;
    tipo?: string;
    id_categoria?: number;
}

interface CartaoOption {
    id_cartao: number;
    nome: string;
    bandeira?: string;
    limite_disponivel?: number | string;
}

interface ModalTransacaoProps {
    visivel: boolean;
    aoFechar: () => void;
    aoSalvarSucesso: () => void;
    transacaoParaEditar?: TransacaoItem | null;
}

// Categorias estáticas para demonstração visual
const CATEGORIAS_DEMO: Categoria[] = [
    { id: 1, nome: 'Alimentação', tipo: 'despesa' },
    { id: 2, nome: 'Salário', tipo: 'receita' },
    { id: 3, nome: 'Lazer', tipo: 'despesa' },
    { id: 4, nome: 'Educação', tipo: 'despesa' },
    { id: 5, nome: 'Investimentos', tipo: 'receita' },
    { id: 6, nome: 'Moradia', tipo: 'despesa' },
];

// Cartões estáticos para demonstração visual
const CARTOES_DEMO: CartaoOption[] = [
    { id_cartao: 1, nome: 'Nubank', bandeira: 'Mastercard' },
    { id_cartao: 2, nome: 'Itaú', bandeira: 'Visa' },
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
    const [valorNumerico, setValorNumerico] = useState(0);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_DEMO);

    // Estados de Cartão de Crédito
    const [cartoes] = useState<CartaoOption[]>(CARTOES_DEMO);
    const [cartaoSelecionado, setCartaoSelecionado] = useState<number | null>(null);

    // Estados de Nova Categoria
    const [criandoCategoria, setCriandoCategoria] = useState(false);
    const [nomeNovaCategoria, setNomeNovaCategoria] = useState('');

    // Estados para edição de categoria
    const [modalEditarCatVisivel, setModalEditarCatVisivel] = useState(false);
    const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<any | null>(null);
    const [novoNomeCategoria, setNovoNomeCategoria] = useState('');

    useEffect(() => {
        if (visivel) {
            if (transacaoParaEditar) {
                preencherParaEdicao(transacaoParaEditar);
            } else {
                resetar();
            }
        }
    }, [visivel, transacaoParaEditar]);

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
        const encontrada = categorias.find((c) => (c.id ?? c.id_categoria) === catId);
        if (encontrada) {
            setCategoriaSelecionada(encontrada);
        } else if (item.categoria?.nome) {
            setCategoriaSelecionada({ id: 99, nome: item.categoria.nome, tipo: tipoNorm });
        }

        const cardId = item.id_cartao ? Number(item.id_cartao) : null;
        setCartaoSelecionado(cardId);
    }

    function handleValorChange(texto: string) {
        const apenasDigitos = texto.replace(/\D/g, '');
        if (!apenasDigitos || apenasDigitos === '0') {
            setValorFormatado('0,00');
            setValorNumerico(0);
            return;
        }

        const centavos = parseInt(apenasDigitos.slice(0, 10), 10);
        const real = centavos / 100;
        setValorNumerico(real);
        setValorFormatado(
            real.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
    }

    function handleAdicionarCategoria() {
        const nomeLimpo = nomeNovaCategoria.trim();
        if (!nomeLimpo) {
            Alert.alert('Atenção', 'Digite o nome da categoria.');
            return;
        }

        const novaCat: Categoria = {
            id: Date.now(),
            nome: nomeLimpo,
            tipo: tipo.toLowerCase(),
        };

        setCategorias((prev) => [novaCat, ...prev]);
        setCategoriaSelecionada(novaCat);
        setNomeNovaCategoria('');
        setCriandoCategoria(false);
    }

    function resetar() {
        setDescricao('');
        setValorFormatado('0,00');
        setValorNumerico(0);
        setCategoriaSelecionada(null);
        setCartaoSelecionado(null);
        setCriandoCategoria(false);
        setNomeNovaCategoria('');
        setTipo('receita');
    }

    function handleSalvar() {
        if (!descricao.trim()) {
            Alert.alert('Atenção', 'Preencha a descrição.');
            return;
        }

        if (valorNumerico <= 0) {
            Alert.alert('Atenção', 'Digite um valor maior que R$ 0,00.');
            return;
        }

        if (!categoriaSelecionada) {
            Alert.alert('Atenção', 'Selecione uma categoria.');
            return;
        }

        Alert.alert(
            'Demonstração',
            transacaoParaEditar
                ? 'Transação simulada e atualizada com sucesso!'
                : 'Transação simulada e confirmada com sucesso!',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        resetar();
                        aoSalvarSucesso();
                        aoFechar();
                    },
                },
            ]
        );
    }

    function iniciarEdicaoCategoria(cat: any) {
        setCategoriaEmEdicao(cat);
        setNovoNomeCategoria(cat.nome);
        setModalEditarCatVisivel(true);
    }

    function handleSalvarEdicaoCategoria() {
        if (!novoNomeCategoria.trim()) {
            Alert.alert('Atenção', 'O nome da categoria não pode ficar vazio.');
            return;
        }

        const idCat = categoriaEmEdicao?.id ?? categoriaEmEdicao?.id_categoria;
        setCategorias((prev) =>
            prev.map((c) =>
                (c.id ?? c.id_categoria) === idCat ? { ...c, nome: novoNomeCategoria.trim() } : c
            )
        );

        if ((categoriaSelecionada?.id ?? categoriaSelecionada?.id_categoria) === idCat) {
            setCategoriaSelecionada({
                ...categoriaSelecionada,
                nome: novoNomeCategoria.trim(),
            });
        }

        Alert.alert('Sucesso', 'Categoria renomeada em modo demonstração!');
        setModalEditarCatVisivel(false);
        setCategoriaEmEdicao(null);
    }

    function handleExcluirCategoria() {
        const idCat = categoriaEmEdicao?.id ?? categoriaEmEdicao?.id_categoria;
        setCategorias((prev) => prev.filter((c) => (c.id ?? c.id_categoria) !== idCat));

        if ((categoriaSelecionada?.id ?? categoriaSelecionada?.id_categoria) === idCat) {
            setCategoriaSelecionada(null);
        }

        Alert.alert('Sucesso', 'Categoria removida em modo demonstração!');
        setModalEditarCatVisivel(false);
        setCategoriaEmEdicao(null);
    }

    const categoriasFiltradas = categorias.filter((c) => {
        if (!c.tipo) return true;
        return c.tipo.includes(tipo.substring(0, 3));
    });

    return (
        <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.containerModal}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                            {/* Topo */}
                            <View style={styles.topoModal}>
                                <Text style={styles.tituloModal}>
                                    {transacaoParaEditar ? 'Editar Transação' : 'Nova Transação'}
                                </Text>
                                <TouchableOpacity onPress={aoFechar}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {/* Seletor Tipo */}
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

                            {/* Valor estilo Nubank */}
                            <Text style={styles.label}>Valor (R$) *</Text>
                            <View style={styles.inputValorContainer}>
                                <Text style={styles.simboloMoeda}>R$</Text>
                                <TextInput
                                    style={styles.inputValorTexto}
                                    value={valorFormatado}
                                    onChangeText={handleValorChange}
                                    keyboardType="number-pad"
                                    selectTextOnFocus
                                />
                            </View>

                            {/* Descrição */}
                            <Text style={styles.label}>Descrição *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Aluguel, Supermercado, Salário"
                                placeholderTextColor="#94a3b8"
                                value={descricao}
                                onChangeText={setDescricao}
                            />

                            {/* Forma de Pagamento */}
                            {tipo === 'despesa' && cartoes.length > 0 && (
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

                                        {cartoes.map((c) => {
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
                            <View style={styles.categoriaHeader}>
                                <Text style={styles.label}>
                                    Categoria *{' '}
                                    {categoriaSelecionada ? (
                                        <Text style={styles.textoSelecionada}>({categoriaSelecionada.nome})</Text>
                                    ) : (
                                        <Text style={styles.textoObrigatorio}>(Toque em uma)</Text>
                                    )}
                                </Text>

                                <TouchableOpacity
                                    style={styles.botaoAddCat}
                                    onPress={() => setCriandoCategoria(!criandoCategoria)}
                                >
                                    <Plus size={14} color="#4f46e5" />
                                    <Text style={styles.textoAddCat}>
                                        {criandoCategoria ? 'Cancelar' : 'Nova'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {criandoCategoria && (
                                <View style={styles.boxNovaCat}>
                                    <TextInput
                                        style={styles.inputNovaCat}
                                        placeholder="Nome da categoria"
                                        placeholderTextColor="#94a3b8"
                                        value={nomeNovaCategoria}
                                        onChangeText={setNomeNovaCategoria}
                                    />
                                    <TouchableOpacity
                                        style={styles.botaoConfirmarNovaCat}
                                        onPress={handleAdicionarCategoria}
                                    >
                                        <Check size={18} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.gradeCategorias}>
                                {categoriasFiltradas.map((cat) => {
                                    const ativa = categoriaSelecionada?.id === cat.id;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.chip,
                                                ativa && (tipo === 'receita' ? styles.chipReceitaAtivo : styles.chipDespesaAtivo),
                                            ]}
                                            onPress={() => setCategoriaSelecionada(cat)}
                                            onLongPress={() => iniciarEdicaoCategoria(cat)}
                                            delayLongPress={350}
                                        >
                                            <Tag size={13} color={ativa ? '#ffffff' : '#64748b'} />
                                            <Text style={[styles.textoChip, ativa && styles.textoChipAtivo]}>
                                                {cat.nome}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Botão Salvar (Visual Demonstrativo) */}
                            <TouchableOpacity
                                style={[styles.botaoSalvar, tipo === 'receita' ? styles.bgReceita : styles.bgDespesa]}
                                onPress={handleSalvar}
                            >
                                <Text style={styles.textoBotaoSalvar}>
                                    {transacaoParaEditar ? 'Atualizar Transação' : 'Confirmar Transação'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>

            {/* Mini-Modal para Renomear/Excluir Categoria em Modo Visual */}
            <Modal
                visible={modalEditarCatVisivel}
                transparent
                animationType="fade"
                onRequestClose={() => setModalEditarCatVisivel(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlayMiniModal}>
                        <View style={styles.caixaMiniModal}>
                            <View style={styles.topoMiniModal}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Edit2 size={18} color="#4f46e5" />
                                    <Text style={styles.tituloMiniModal}>Editar Categoria</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setModalEditarCatVisivel(false)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <X size={22} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.labelMiniModal}>Nome da Categoria</Text>

                            <View style={styles.linhaInputComAcao}>
                                <TextInput
                                    style={styles.inputMiniModalComAcao}
                                    value={novoNomeCategoria}
                                    onChangeText={setNovoNomeCategoria}
                                    placeholder="Ex: Alimentação, Curso..."
                                    placeholderTextColor="#94a3b8"
                                    autoFocus
                                />

                                <TouchableOpacity
                                    style={styles.botaoExcluirInput}
                                    onPress={handleExcluirCategoria}
                                    activeOpacity={0.7}
                                >
                                    <Trash2 size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.linhaBotoesMiniModal}>
                                <TouchableOpacity
                                    style={styles.botaoCancelarMiniModal}
                                    onPress={() => setModalEditarCatVisivel(false)}
                                >
                                    <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.botaoSalvarMiniModal}
                                    onPress={handleSalvarEdicaoCategoria}
                                >
                                    <Text style={styles.textoBotaoSalvarMini}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    categoriaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    botaoAddCat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
    },
    textoAddCat: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    boxNovaCat: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    inputNovaCat: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#94a3b8',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#0f172a',
    },
    botaoConfirmarNovaCat: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
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
    textoSelecionada: {
        color: '#4f46e5',
        fontWeight: 'bold',
    },
    textoObrigatorio: {
        color: '#ef4444',
        fontWeight: 'normal',
        fontSize: 12,
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
    overlayMiniModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 9999,
        elevation: 20,
    },
    caixaMiniModal: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    topoMiniModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    tituloMiniModal: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    labelMiniModal: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    linhaInputComAcao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    inputMiniModalComAcao: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0f172a',
    },
    botaoExcluirInput: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#fecaca',
        alignItems: 'center',
        justifyContent: 'center',
    },
    linhaBotoesMiniModal: {
        flexDirection: 'row',
        gap: 10,
    },
    botaoCancelarMiniModal: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    textoBotaoCancelar: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    botaoSalvarMiniModal: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
    },
    textoBotaoSalvarMini: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});