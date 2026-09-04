import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import { api } from '@/services/api';
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
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [carregandoCategorias, setCarregandoCategorias] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Estados de Cartão de Crédito
    const [cartoes, setCartoes] = useState<CartaoOption[]>([]);
    const [cartaoSelecionado, setCartaoSelecionado] = useState<number | null>(null);

    // Estados de Nova Categoria
    const [criandoCategoria, setCriandoCategoria] = useState(false);
    const [nomeNovaCategoria, setNomeNovaCategoria] = useState('');
    const [salvandoNovaCat, setSalvandoNovaCat] = useState(false);

    // Estados para edição/renomeação de categoria
    const [modalEditarCatVisivel, setModalEditarCatVisivel] = useState(false);
    const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<any | null>(null);
    const [novoNomeCategoria, setNovoNomeCategoria] = useState('');
    const [salvandoCategoria, setSalvandoCategoria] = useState(false);

    useEffect(() => {
        if (visivel) {
            buscarCategorias();
            buscarCartoes();

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

    async function handleAdicionarCategoria() {
        const nomeLimpo = nomeNovaCategoria.trim();
        if (!nomeLimpo) {
            Alert.alert('Atenção', 'Digite o nome da categoria.');
            return;
        }

        try {
            setSalvandoNovaCat(true);
            const res = await api.post('/categorias', {
                nome: nomeLimpo,
                tipo: tipo.toLowerCase(),
            });

            const ret = res.data?.categoria || res.data;
            const novaCat: Categoria = {
                id: Number(ret?.id ?? ret?.id_categoria ?? Date.now()),
                nome: ret?.nome || nomeLimpo,
                tipo: tipo.toLowerCase(),
            };

            setCategorias((prev) => [novaCat, ...prev]);
            setCategoriaSelecionada(novaCat);
            setNomeNovaCategoria('');
            setCriandoCategoria(false);
        } catch {
            await buscarCategorias();
            const encontrada = categorias.find((c) => c.nome.toLowerCase() === nomeLimpo.toLowerCase());
            if (encontrada) setCategoriaSelecionada(encontrada);
            setNomeNovaCategoria('');
            setCriandoCategoria(false);
        } finally {
            setSalvandoNovaCat(false);
        }
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

    async function handleSalvar() {
        if (!descricao.trim()) {
            Alert.alert('Atenção', 'Preencha a descrição.');
            return;
        }

        if (valorNumerico <= 0) {
            Alert.alert('Atenção', 'Digite um valor maior que R$ 0,00.');
            return;
        }

        const idCat = categoriaSelecionada
            ? Number(categoriaSelecionada.id ?? (categoriaSelecionada as any).id_categoria)
            : null;

        if (!idCat || isNaN(idCat)) {
            Alert.alert('Atenção', 'Selecione uma categoria.');
            return;
        }

        try {
            setSalvando(true);
            const hoje = new Date().toISOString().split('T')[0];

            const payload = {
                descricao: descricao.trim(),
                valor: valorNumerico,
                tipo: tipo.toLowerCase(),
                id_categoria: idCat,
                categoria_id: idCat,
                data: hoje,
                data_transacao: hoje,
                id_cartao: tipo === 'despesa' ? cartaoSelecionado : null,
            };

            const idTransacao = transacaoParaEditar?.id ?? transacaoParaEditar?.id_transacao;

            if (idTransacao) {
                await api.put(`/transacoes/${idTransacao}`, payload);
                Alert.alert('Sucesso', 'Transação atualizada com sucesso!');
            } else {
                await api.post('/transacoes', payload);
                Alert.alert('Sucesso', 'Transação cadastrada com sucesso!');
            }

            resetar();
            aoSalvarSucesso();
            aoFechar();
        } catch (error: any) {
            console.error('Erro ao salvar transação:', error.response?.data || error.message);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Erro ao processar requisição.';
            Alert.alert('Erro', msg);
        } finally {
            setSalvando(false);
        }
    }

    function iniciarEdicaoCategoria(cat: any) {
        setCategoriaEmEdicao(cat);
        setNovoNomeCategoria(cat.nome);
        setModalEditarCatVisivel(true);
    }

    async function handleSalvarEdicaoCategoria() {
        if (!categoriaEmEdicao) return;
        if (!novoNomeCategoria.trim()) {
            Alert.alert('Atenção', 'O nome da categoria não pode ficar vazio.');
            return;
        }

        const idCat = categoriaEmEdicao.id ?? categoriaEmEdicao.id_categoria;

        try {
            setSalvandoCategoria(true);
            await api.put(`/categorias/${idCat}`, {
                nome: novoNomeCategoria.trim(),
            });

            // Atualiza localmente na lista de categorias do modal
            setCategorias((prev: any[]) =>
                prev.map((c) =>
                    (c.id ?? c.id_categoria) === idCat ? { ...c, nome: novoNomeCategoria.trim() } : c
                )
            );

            // Se a categoria alterada for a selecionada atualmente, atualiza a seleção
            if ((categoriaSelecionada?.id ?? categoriaSelecionada?.id_categoria) === idCat) {
                setCategoriaSelecionada({
                    ...categoriaSelecionada,
                    id: Number(idCat),
                    nome: novoNomeCategoria.trim(),
                });
            }

            Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
            setModalEditarCatVisivel(false);
            setCategoriaEmEdicao(null);
        } catch (error: any) {
            console.error('Erro ao editar categoria:', error.response?.data || error.message);
            const msg = error.response?.data?.error || 'Não foi possível atualizar a categoria.';
            Alert.alert('Erro', msg);
        } finally {
            setSalvandoCategoria(false);
        }
    }

    function handleExcluirCategoria() {
        if (!categoriaEmEdicao) return;

        const idCat = categoriaEmEdicao.id ?? categoriaEmEdicao.id_categoria;
        const nomeCat = categoriaEmEdicao.nome;

        Alert.alert(
            'Excluir Categoria',
            `Deseja realmente remover a categoria "${nomeCat}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSalvandoCategoria(true);
                            await api.delete(`/categorias/${idCat}`);

                            // Remove da lista local imediatamente
                            setCategorias((prev) =>
                                prev.filter((c) => (c.id ?? c.id_categoria) !== idCat)
                            );

                            // Se for a categoria atualmente selecionada, desseleciona
                            if ((categoriaSelecionada?.id ?? categoriaSelecionada?.id_categoria) === idCat) {
                                setCategoriaSelecionada(null);
                            }

                            Alert.alert('Sucesso', 'Categoria removida com sucesso!');
                            setModalEditarCatVisivel(false);
                            setCategoriaEmEdicao(null);
                        } catch (error: any) {
                            console.error('Erro ao excluir categoria:', error.response?.data || error.message);
                            const msg =
                                error.response?.data?.error ||
                                error.response?.data?.message ||
                                'Não foi possível remover a categoria.';
                            Alert.alert('Erro', msg);
                        } finally {
                            setSalvandoCategoria(false);
                        }
                    },
                },
            ]
        );
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
                                <TouchableOpacity onPress={aoFechar} disabled={salvando}>
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

                            {/* Forma de Pagamento (Apenas quando for Despesa) */}
                            {tipo === 'despesa' && cartoes.length > 0 && (
                                <View style={styles.secaoPagamento}>
                                    <Text style={styles.label}>Forma de Pagamento</Text>
                                    <View style={styles.gradePagamento}>
                                        {/* Opção 1: Dinheiro / Conta */}
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

                                        {/* Opção Cartões de Crédito */}
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
                                        disabled={salvandoNovaCat}
                                    >
                                        {salvandoNovaCat ? (
                                            <ActivityIndicator size="small" color="#ffffff" />
                                        ) : (
                                            <Check size={18} color="#ffffff" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}

                            {carregandoCategorias ? (
                                <ActivityIndicator size="small" color="#4f46e5" style={{ marginVertical: 12 }} />
                            ) : (
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
                                                    onLongPress={() => iniciarEdicaoCategoria(cat)} // 👈 GATILHO QUE FALTAVA
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
                            )}

                            {/* Botão Salvar */}
                            <TouchableOpacity
                                style={[styles.botaoSalvar, tipo === 'receita' ? styles.bgReceita : styles.bgDespesa]}
                                onPress={handleSalvar}
                                disabled={salvando}
                            >
                                {salvando ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.textoBotaoSalvar}>
                                        {transacaoParaEditar ? 'Atualizar Transação' : 'Confirmar Transação'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
            {/* Mini-Modal para Renomear Categoria */}
            <Modal
                visible={modalEditarCatVisivel}
                transparent
                animationType="fade"
                onRequestClose={() => setModalEditarCatVisivel(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlayMiniModal}>
                        <View style={styles.caixaMiniModal}>
                            {/* Topo do Modal: apenas título e botão de fechar */}
                            <View style={styles.topoMiniModal}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Edit2 size={18} color="#4f46e5" />
                                    <Text style={styles.tituloMiniModal}>Editar Categoria</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setModalEditarCatVisivel(false)}
                                    disabled={salvandoCategoria}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <X size={22} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.labelMiniModal}>Nome da Categoria</Text>

                            {/* Linha com Input + Botão de Excluir */}
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
                                    disabled={salvandoCategoria}
                                    activeOpacity={0.7}
                                >
                                    <Trash2 size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            {/* Botões de Ação */}
                            <View style={styles.linhaBotoesMiniModal}>
                                <TouchableOpacity
                                    style={styles.botaoCancelarMiniModal}
                                    onPress={() => setModalEditarCatVisivel(false)}
                                    disabled={salvandoCategoria}
                                >
                                    <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.botaoSalvarMiniModal}
                                    onPress={handleSalvarEdicaoCategoria}
                                    disabled={salvandoCategoria}
                                >
                                    {salvandoCategoria ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    ) : (
                                        <Text style={styles.textoBotaoSalvarMini}>Salvar</Text>
                                    )}
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

    // Modal Editar Categoria
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