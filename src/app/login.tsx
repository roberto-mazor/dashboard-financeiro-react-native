import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        } catch (error: any) {
            Alert.alert('Erro', 'E-mail ou senha incorretos.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background justify-center px-6">

            {/* Título */}
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold text-indigo-PRIMARY">Indigo Finance</Text>
                <Text className="text-variant text-base">Controle Financeiro Mobile</Text>
            </View>

            {/* Formulário */}
            <View className="bg-surface p-6 rounded-2xl border border-slate-200">
                <Text className="text-lg font-semibold text-slate-800 mb-4">Entrar</Text>

                {/* E-mail */}
                <Text className="text-sm text-slate-600 mb-1">E-mail</Text>
                <TextInput
                    className="bg-slate-100 p-3 rounded-xl mb-4 text-slate-800"
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                {/* Senha */}
                <Text className="text-sm text-slate-600 mb-1">Senha</Text>
                <TextInput
                    className="bg-slate-100 p-3 rounded-xl mb-6 text-slate-800"
                    placeholder="••••••••"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                />

                {/* Botão */}
                <TouchableOpacity
                    className="bg-indigo-PRIMARY p-4 rounded-xl items-center"
                    onPress={handleLogin}
                    disabled={carregando}
                >
                    {carregando ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className="text-white font-bold text-base">Entrar</Text>
                    )}
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}