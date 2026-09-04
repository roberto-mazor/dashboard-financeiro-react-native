import React, { useState } from 'react';
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
import { X, CreditCard } from 'lucide-react-native';

interface ModalNovoCartaoProps {
    visivel: boolean;
    aoFechar: () => void;
    aoSalvarSucesso: () => void;
}

const BANDEIRAS_PADRAO = ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex'];

export function ModalNovoCartao({
    visivel,
    aoFechar,
    aoSalvarSucesso,
}: ModalNovoCartaoProps) {
    const [nome, setNome] = useState('');
    const [bandeira, setBandeira] = useState('Visa');
    const [limiteFormatado, setLimiteFormatado] = useState('0,00');
    const [limiteNumerico, setLimiteNumerico] = useState(0);
    const [diaFechamento, setDiaFechamento] = useState('5');
    const [diaVencimento, setDiaVencimento] = useState('15');
    const [salvando, setSalvando] = useState(false);

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

    function resetar() {
        setNome('');
        setBandeira('Visa');
        setLimiteFormatado('0,00');
        setLimiteNumerico(0);
        setDiaFechamento('5');
        setDiaVencimento('15');
    }

    async function handleSalvar() {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'Informe o nome do cartão (ex: Nubank, Itaú).');
            return;
        }

        if (limiteNumerico <= 0) {
            Alert.alert('Atenção', 'Informe um limite total válido.');
            return;
        }

        const fechamento = parseInt(diaFechamento, 10);
        const vencimento = parseInt(diaVencimento, 10);

        if (isNaN(fechamento) || fechamento < 1 || fechamento > 31) {
            Alert.alert('Atenção', 'O dia de fechamento deve ser entre 1 e 31.');
            return;
        }

        if (isNaN(vencimento) || vencimento < 1 || vencimento > 31) {
            Alert.alert('Atenção', 'O dia de vencimento deve ser entre 1 e 31.');
            return;
        }

        try {
            setSalvando(true);
            await api.post('/cartoes', {
                nome: nome.trim(),
                bandeira: bandeira.trim(),
                limite_total: limiteNumerico,
                dia_fechamento: fechamento,
                dia_vencimento: vencimento,
            });

            Alert.alert('Sucesso', 'Cartão cadastrado com sucesso!');
            resetar();
            aoSalvarSucesso();
            aoFechar();
        } catch (error: any) {
            console.error('Erro ao cadastrar cartão:', error.response?.data || error.message);
            const msg =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Não foi possível cadastrar o cartão.';
            Alert.alert('Erro', msg);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.containerModal}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                            {/* Cabeçalho */}
                            <View style={styles.topoModal}>
                                <View style={styles.tituloWrapper}>
                                    <CreditCard size={22} color="#4f46e5" />
                                    <Text style={styles.tituloModal}>Novo Cartão</Text>
                                </View>
                                <TouchableOpacity onPress={aoFechar} disabled={salvando}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {/* Nome do Cartão */}
                            <Text style={styles.label}>Nome do Cartão / Banco *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Itaú Click, Nubank Ultravioleta"
                                placeholderTextColor="#94a3b8"
                                value={nome}
                                onChangeText={setNome}
                            />

                            {/* Limite Total */}
                            <Text style={styles.label}>Limite Total (R$) *</Text>
                            <View style={styles.inputValorContainer}>
                                <Text style={styles.simboloMoeda}>R$</Text>
                                <TextInput
                                    style={styles.inputValorTexto}
                                    value={limiteFormatado}
                                    onChangeText={handleLimiteChange}
                                    keyboardType="number-pad"
                                    selectTextOnFocus
                                />
                            </View>

                            {/* Seletor de Bandeira */}
                            <Text style={styles.label}>Bandeira *</Text>
                            <View style={styles.gradeBandeiras}>
                                {BANDEIRAS_PADRAO.map((b) => {
                                    const ativa = bandeira.toLowerCase() === b.toLowerCase();
                                    return (
                                        <TouchableOpacity
                                            key={b}
                                            style={[styles.chipBandeira, ativa && styles.chipBandeiraAtivo]}
                                            onPress={() => setBandeira(b)}
                                        >
                                            <Text style={[styles.textoBandeira, ativa && styles.textoBandeiraAtivo]}>
                                                {b}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Datas de Fechamento e Vencimento */}
                            <View style={styles.linhaDatas}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Dia Fechamento *</Text>
                                    <TextInput
                                        style={styles.inputData}
                                        placeholder="Ex: 5"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        value={diaFechamento}
                                        onChangeText={setDiaFechamento}
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Dia Vencimento *</Text>
                                    <TextInput
                                        style={styles.inputData}
                                        placeholder="Ex: 15"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        value={diaVencimento}
                                        onChangeText={setDiaVencimento}
                                    />
                                </View>
                            </View>

                            {/* Botão Salvar */}
                            <TouchableOpacity
                                style={styles.botaoSalvar}
                                onPress={handleSalvar}
                                disabled={salvando}
                            >
                                {salvando ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.textoBotaoSalvar}>Cadastrar Cartão</Text>
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
        marginBottom: 20,
    },
    tituloWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tituloModal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#0f172a',
        marginBottom: 16,
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
        marginBottom: 16,
    },
    simboloMoeda: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#64748b',
        marginRight: 8,
    },
    inputValorTexto: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    gradeBandeiras: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chipBandeira: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    chipBandeiraAtivo: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    textoBandeira: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    textoBandeiraAtivo: {
        color: '#ffffff',
    },
    linhaDatas: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    inputData: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#0f172a',
        textAlign: 'center',
    },
    botaoSalvar: {
        backgroundColor: '#4f46e5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    textoBotaoSalvar: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});