import React, { useState } from 'react';
import {
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
import { useRouter } from 'expo-router';
import { api } from '@/services/api';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function Cadastro() {
    const router = useRouter();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function handleCadastro() {
        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (!nomeLimpo || !emailLimpo || !senha || !confirmarSenha) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
            return;
        }

        if (!emailLimpo.includes('@') || !emailLimpo.includes('.')) {
            Alert.alert('Atenção', 'Insira um e-mail válido.');
            return;
        }

        if (senha.length < 3) {
            Alert.alert('Atenção', 'A senha deve conter no mínimo 3 caracteres.');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Atenção', 'As senhas não coincidem.');
            return;
        }

        try {
            setCarregando(true);

            // Ajuste aqui se a sua rota for /usuarios/registrar ou /auth/registrar
            const res = await api.post('/auth/register', {
                nome: nomeLimpo,
                email: emailLimpo,
                senha: senha,
            });

            Alert.alert(
                'Conta criada com sucesso!',
                'Seu cadastro foi realizado. Faça login para acessar.',
                [
                    {
                        text: 'Entrar',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
        } catch (error: any) {
            console.log('--- ERRO DETALHADO DO CADASTRO ---');
            console.log('Status HTTP:', error.response?.status);
            console.log('Resposta da API:', error.response?.data);
            console.log('Mensagem de erro:', error.message);
            console.log('-----------------------------------');

            // Captura a mensagem real enviada pelo backend
            const dados = error.response?.data;
            const mensagemReal =
                dados?.error ||
                dados?.message ||
                dados?.detalhes ||
                (typeof dados === 'string' ? dados : null) ||
                (error.response?.status === 404 ? 'Rota da API não encontrada (404). Verifique o endpoint.' : null) ||
                (error.response?.status === 500 ? 'Erro interno no servidor do banco (500).' : null) ||
                'Não foi possível conectar com o servidor.';

            Alert.alert('Erro ao cadastrar', mensagemReal);
        } finally {
            setCarregando(false);
        }
    }

    return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Botão Voltar */}
                    <TouchableOpacity
                        style={styles.botaoVoltar}
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft size={22} color="#0f172a" />
                    </TouchableOpacity>

                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Text style={styles.titulo}>Criar conta</Text>
                        <Text style={styles.subtitulo}>
                            Comece a organizar suas finanças pessoais de forma simples e segura.
                        </Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.form}>
                        {/* Campo Nome */}
                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Nome completo</Text>
                            <View style={styles.inputBox}>
                                <User size={18} color="#94a3b8" style={styles.iconeInput} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Seu nome completo"
                                    placeholderTextColor="#94a3b8"
                                    value={nome}
                                    onChangeText={setNome}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        {/* Campo E-mail */}
                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>E-mail</Text>
                            <View style={styles.inputBox}>
                                <Mail size={18} color="#94a3b8" style={styles.iconeInput} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="exemplo@email.com"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Campo Senha */}
                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Senha</Text>
                            <View style={styles.inputBox}>
                                <Lock size={18} color="#94a3b8" style={styles.iconeInput} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mínimo de 6 caracteres"
                                    placeholderTextColor="#94a3b8"
                                    value={senha}
                                    onChangeText={setSenha}
                                    secureTextEntry={!mostrarSenha}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setMostrarSenha(!mostrarSenha)}
                                    style={styles.botaoOlho}
                                >
                                    {mostrarSenha ? (
                                        <EyeOff size={18} color="#64748b" />
                                    ) : (
                                        <Eye size={18} color="#64748b" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Campo Confirmar Senha */}
                        <View style={styles.campoContainer}>
                            <Text style={styles.label}>Confirmar senha</Text>
                            <View style={styles.inputBox}>
                                <Lock size={18} color="#94a3b8" style={styles.iconeInput} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Repita sua senha"
                                    placeholderTextColor="#94a3b8"
                                    value={confirmarSenha}
                                    onChangeText={setConfirmarSenha}
                                    secureTextEntry={!mostrarConfirmar}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
                                    style={styles.botaoOlho}
                                >
                                    {mostrarConfirmar ? (
                                        <EyeOff size={18} color="#64748b" />
                                    ) : (
                                        <Eye size={18} color="#64748b" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Botão Cadastrar */}
                        <TouchableOpacity
                            style={[styles.botaoCadastrar, carregando && styles.botaoDesativado]}
                            onPress={handleCadastro}
                            disabled={carregando}
                            activeOpacity={0.8}
                        >
                            {carregando ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <View style={styles.linhaBotao}>
                                    <Text style={styles.textoBotaoCadastrar}>Criar minha conta</Text>
                                    <CheckCircle2 size={18} color="#ffffff" />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Rodapé: Já possui conta? */}
                        <View style={styles.footer}>
                            <Text style={styles.textoFooter}>Já tem uma conta? </Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text style={styles.linkLogin}>Fazer login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>

)}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 32,
        justifyContent: 'center',
    },
    botaoVoltar: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 28,
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitulo: {
        fontSize: 15,
        color: '#64748b',
        lineHeight: 22,
    },
    form: {
        gap: 16,
    },
    campoContainer: {
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 50,
    },
    iconeInput: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#0f172a',
        height: '100%',
    },
    botaoOlho: {
        padding: 6,
    },
    botaoCadastrar: {
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    botaoDesativado: {
        opacity: 0.7,
    },
    linhaBotao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    textoBotaoCadastrar: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    textoFooter: {
        fontSize: 14,
        color: '#64748b',
    },
    linkLogin: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
});