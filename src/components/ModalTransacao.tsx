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
import { X, TrendingUp, TrendingDown, Tag, Plus, Check } from 'lucide-react-native';

interface Categoria {
    id: number;
    nome: string;
    tipo?: string;
    id_categoria?: number;
}

interface ModalTransacaoProps {
    visivel: boolean;
    aoFechar: () => void;
    aoSalvarSucesso: () => void;
}

export function ModalTransacao({ visivel, aoFechar, aoSalvarSucesso }: ModalTransacaoProps) {
    const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
    const [descricao, setDescricao] = useState('');
    const [valorFormatado, setValorFormatado] = useState('0,00');
    const [valorNumerico, setValorNumerico] = useState(0);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [carregandoCategorias, setCarregandoCategorias] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Estados de criação de categoria
    const [criandoCategoria, setCriandoCategoria] = useState(false);
    const [nomeNovaCategoria, setNomeNovaCategoria] = useState('');
    const [salvandoNovaCat, setSalvandoNovaCat] = useState(false);

    useEffect(() => {
        if (visivel) {
            buscarCategorias();
        }
    }, [visivel]);

    useEffect(() => {
        setCategoriaSelecionada(null);
        setCriandoCategoria(false);
        setNomeNovaCategoria('');
        if (visivel) {
            buscarCategorias();
        }
    }, [tipo]);

    // Máscara estilo Nubank (centavos da direita para a esquerda)
    function handleValorChange(texto: string) {
        // Remove tudo que não for número
        const apenasDigitos = texto.replace(/\D/g, '');

        if (!apenasDigitos || apenasDigitos === '0') {
            setValorFormatado('0,00');
            setValorNumerico(0);
            return;
        }

        // Limita tamanho para evitar overflow (máximo R$ 9.999.999,99)
        const digitosLimitados = apenasDigitos.slice(0, 10);
        const centavos = parseInt(digitosLimitados, 10);
        const numeroReal = centavos / 100;

        setValorNumerico(numeroReal);
        setValorFormatado(
            numeroReal.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        );
    }

    async function buscarCategorias() {
        try {
            setCarregandoCategorias(true);
            const res = await api.get('/categorias');
            const listaBruta = res.data?.categorias || res.data || [];

            if (Array.isArray(listaBruta)) {
                const listaNormalizada: Categoria[] = listaBruta.map((cat: any) => ({
                    id: Number(cat.id ?? cat.id_categoria),
                    nome: cat.nome || cat.descricao || 'Sem nome',
                    tipo: (cat.tipo || '').toLowerCase(),
                }));
                setCategorias(listaNormalizada);
            }
        } catch (error: any) {
            console.error('Erro ao buscar categorias:', error.response?.data || error.message);
        } finally {
            setCarregandoCategorias(false);
        }
    }

    async function handleAdicionarCategoria() {
        const nomeLimpo = nomeNovaCategoria.trim();
        if (!nomeLimpo) {
            Alert.alert('Atenção', 'Digite o nome da categoria.');
            return;
        }

        const jaExiste = categorias.find(
            (c) => c.nome.toLowerCase() === nomeLimpo.toLowerCase()
        );
        if (jaExiste) {
            setCategoriaSelecionada(jaExiste);
            setNomeNovaCategoria('');
            setCriandoCategoria(false);
            return;
        }

        try {
            setSalvandoNovaCat(true);
            const res = await api.post('/categorias', {
                nome: nomeLimpo,
                tipo: tipo.toLowerCase(),
            });

            const retorno = res.data?.categoria || res.data;
            const novaId = Number(retorno?.id ?? retorno?.id_categoria ?? Date.now());

            const novaCat: Categoria = {
                id: novaId,
                nome: retorno?.nome || nomeLimpo,
                tipo: tipo.toLowerCase(),
            };

            setCategorias((prev) => [novaCat, ...prev]);
            setCategoriaSelecionada(novaCat);
            setNomeNovaCategoria('');
            setCriandoCategoria(false);
            Alert.alert('Sucesso', `Categoria "${novaCat.nome}" cadastrada!`);
        } catch {
            await buscarCategorias();
            const encontrada = categorias.find((c) => c.nome.toLowerCase() === nomeLimpo.toLowerCase());
            if (encontrada) {
                setCategoriaSelecionada(encontrada);
            }
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

        const idFinalCategoria = categoriaSelecionada
            ? Number(categoriaSelecionada.id ?? (categoriaSelecionada as any).id_categoria)
            : null;

        if (!categoriaSelecionada || !idFinalCategoria || isNaN(idFinalCategoria)) {
            Alert.alert('Atenção', 'Selecione uma categoria.');
            return;
        }

        try {
            setSalvando(true);

            const hoje = new Date();
            const dataFormatada = hoje.toISOString().split('T')[0];

            const payload = {
                descricao: descricao.trim(),
                valor: valorNumerico,
                tipo: tipo.toLowerCase(),
                id_categoria: idFinalCategoria,
                categoria_id: idFinalCategoria,
                data_transacao: dataFormatada,
                data: dataFormatada,
                id_cartao: null,
            };

            await api.post('/transacoes', payload);

            Alert.alert('Sucesso', 'Transação cadastrada com sucesso!');
            resetar();
            aoSalvarSucesso();
            aoFechar();
        } catch (error: any) {
            console.error('Erro ao salvar transação:', error.response?.data || error.message);
            const msg =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Erro ao salvar transação no servidor.';
            Alert.alert('Erro', msg);
        } finally {
            setSalvando(false);
        }
    }

    const categoriasFiltradas = categorias.filter((c) => {
        if (!c.tipo) return true;
        return c.tipo.toLowerCase() === tipo.toLowerCase();
    });

    return (
        <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.containerModal}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                            {/* Topo */}
                            <View style={styles.topoModal}>
                                <Text style={styles.tituloModal}>Nova Transação</Text>
                                <TouchableOpacity onPress={aoFechar} disabled={salvando}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {/* Botões Tipo */}
                            <View style={styles.containerTipo}>
                                <TouchableOpacity
                                    style={[
                                        styles.botaoTipo,
                                        tipo === 'receita' && styles.botaoTipoReceitaAtivo,
                                    ]}
                                    onPress={() => setTipo('receita')}
                                >
                                    <TrendingUp size={18} color={tipo === 'receita' ? '#ffffff' : '#10b981'} />
                                    <Text
                                        style={[
                                            styles.textoTipo,
                                            tipo === 'receita' && styles.textoTipoAtivo,
                                        ]}
                                    >
                                        Receita
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.botaoTipo,
                                        tipo === 'despesa' && styles.botaoTipoDespesaAtivo,
                                    ]}
                                    onPress={() => setTipo('despesa')}
                                >
                                    <TrendingDown size={18} color={tipo === 'despesa' ? '#ffffff' : '#ef4444'} />
                                    <Text
                                        style={[
                                            styles.textoTipo,
                                            tipo === 'despesa' && styles.textoTipoAtivo,
                                        ]}
                                    >
                                        Despesa
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Input de Valor Estilo Nubank */}
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
                                placeholder="Ex: Salário, Supermercado, Freelance"
                                placeholderTextColor="#94a3b8"
                                value={descricao}
                                onChangeText={setDescricao}
                            />

                            {/* Cabeçalho de Categoria */}
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
                                        {criandoCategoria ? 'Cancelar' : '+ Nova'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Input Nova Categoria */}
                            {criandoCategoria && (
                                <View style={styles.boxNovaCat}>
                                    <TextInput
                                        style={styles.inputNovaCat}
                                        placeholder="Nome da categoria (Ex: Vendas)"
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

                            {/* Grade de Categorias */}
                            {carregandoCategorias ? (
                                <ActivityIndicator size="small" color="#4f46e5" style={{ marginVertical: 12 }} />
                            ) : categoriasFiltradas.length === 0 ? (
                                <View style={styles.boxSemCategorias}>
                                    <Text style={styles.textoSemCategorias}>
                                        Nenhuma categoria de {tipo} cadastrada. Clique em "+ Nova" para adicionar.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.gradeCategorias}>
                                    {categoriasFiltradas.map((cat) => {
                                        const ativa = categoriaSelecionada?.id === cat.id;
                                        return (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.chip,
                                                    ativa &&
                                                    (tipo === 'receita'
                                                        ? styles.chipReceitaAtivo
                                                        : styles.chipDespesaAtivo),
                                                ]}
                                                onPress={() => setCategoriaSelecionada(cat)}
                                                activeOpacity={0.7}
                                            >
                                                <Tag
                                                    size={13}
                                                    color={ativa ? '#ffffff' : '#64748b'}
                                                />
                                                <Text
                                                    style={[
                                                        styles.textoChip,
                                                        ativa && styles.textoChipAtivo,
                                                    ]}
                                                >
                                                    {cat.nome}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Botão de Envio */}
                            <TouchableOpacity
                                style={[
                                    styles.botaoSalvar,
                                    tipo === 'receita' ? styles.bgReceita : styles.bgDespesa,
                                ]}
                                onPress={handleSalvar}
                                disabled={salvando}
                            >
                                {salvando ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.textoBotaoSalvar}>Confirmar Transação</Text>
                                )}
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
    boxSemCategorias: {
        width: '100%',
        padding: 14,
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textoSemCategorias: {
        color: '#64748b',
        fontSize: 13,
        textAlign: 'center',
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