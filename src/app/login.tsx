import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);

    const { login } = useAuth();

    async function handleLogin() {
        if (!email || !senha) {
            Alert.alert('Atenção', 'Preencha todos os campos!');
            return;
        }

        try {
            setCarregando(true);
            await login(email, senha);
            router.replace('/(tabs)');
        } catch (error: any) {
            const mensagemBackend = error.response?.data?.error || error.response?.data?.message;
            Alert.alert('Erro ao entrar', mensagemBackend || 'Verifique seus dados ou a conexão com a API.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>

            {/* Título */}
            <View style={styles.header}>
                <Text style={styles.tituloApp}>Indigo Finance</Text>
                <Text style={styles.subtituloApp}>Controle Financeiro Mobile</Text>
            </View>

            {/* Formulário */}
            <View style={styles.card}>
                <Text style={styles.tituloCard}>Entrar</Text>

                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={(texto) => setEmail(texto.trim().toLowerCase())}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    value={senha}
                    onChangeText={(texto) => setSenha(texto.trim())}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.botao}
                    onPress={handleLogin}
                    disabled={carregando}
                >
                    {carregando ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.textoBotao}>Entrar</Text>
                    )}
                </TouchableOpacity>

                {/* Link para Cadastro */}
                <View style={styles.footerCadastro}>
                    <Text style={styles.textoFooter}>Não tem uma conta? </Text>
                    <TouchableOpacity onPress={() => router.push('/cadastro')}>
                        <Text style={styles.linkCadastro}>Cadastre-se</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8ff',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    tituloApp: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    subtituloApp: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
    },
    tituloCard: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
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
        fontSize: 16,
        color: '#0f172a',
        marginBottom: 16,
    },
    botao: {
        backgroundColor: '#4f46e5',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    textoBotao: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerCadastro: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    textoFooter: {
        fontSize: 14,
        color: '#64748b',
    },
    linkCadastro: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
});