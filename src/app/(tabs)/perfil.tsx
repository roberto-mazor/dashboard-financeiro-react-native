import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react-native';
import { router } from 'expo-router';

export default function Perfil() {
    const { usuario, logout } = useAuth();

    async function handleLogout() {
        await logout();
        router.replace('/login');
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <User color="#4f46e5" size={40} />
                </View>
                <Text style={styles.nome}>{usuario?.nome || 'Usuário'}</Text>
                <Text style={styles.email}>{usuario?.email || 'email@exemplo.com'}</Text>
            </View>

            <TouchableOpacity style={styles.botaoSair} onPress={handleLogout}>
                <LogOut color="#ef4444" size={20} />
                <Text style={styles.textoBotaoSair}>Sair da Conta</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8ff',
        padding: 20,
        justifyContent: 'space-between',
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: 30,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    nome: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    email: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    botaoSair: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    textoBotaoSair: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
});