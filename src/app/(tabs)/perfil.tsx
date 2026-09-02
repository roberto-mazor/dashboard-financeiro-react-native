import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { User, Mail, LogOut, ShieldCheck } from 'lucide-react-native';

export default function PerfilScreen() {
    const auth = useAuth() as any;
    const usuario = auth.usuario || auth.user;

    // Captura a função de logout com qualquer convenção comum
    const executarLogout = auth.signOut || auth.logout || auth.sair || auth.deslogar;

    function handleLogout() {
        Alert.alert('Sair da Conta', 'Deseja realmente encerrar a sessão?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    if (typeof executarLogout === 'function') {
                        await executarLogout();
                    }
                    router.replace('/login');
                },
            },
        ]);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Meu Perfil</Text>
                <Text style={styles.subtitulo}>Gerencie suas informações e preferências</Text>
            </View>

            <View style={styles.conteudo}>
                {/* Avatar / Cabeçalho de Perfil */}
                <View style={styles.cardPerfil}>
                    <View style={styles.avatar}>
                        <User size={40} color="#4f46e5" />
                    </View>
                    <Text style={styles.nome}>{usuario?.nome || 'Usuário'}</Text>
                    <Text style={styles.email}>{usuario?.email || 'email@exemplo.com'}</Text>
                </View>

                {/* Detalhes da Conta */}
                <View style={styles.secao}>
                    <View style={styles.itemInfo}>
                        <View style={styles.itemEsquerda}>
                            <Mail size={20} color="#64748b" />
                            <Text style={styles.labelInfo}>E-mail</Text>
                        </View>
                        <Text style={styles.valorInfo}>{usuario?.email || '-'}</Text>
                    </View>

                    <View style={styles.itemInfo}>
                        <View style={styles.itemEsquerda}>
                            <ShieldCheck size={20} color="#64748b" />
                            <Text style={styles.labelInfo}>Status da Conta</Text>
                        </View>
                        <Text style={[styles.valorInfo, { color: '#10b981', fontWeight: 'bold' }]}>
                            Ativa
                        </Text>
                    </View>
                </View>

                {/* Botão de Logout */}
                <TouchableOpacity style={styles.botaoSair} onPress={handleLogout} activeOpacity={0.8}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.textoSair}>Sair da Conta</Text>
                </TouchableOpacity>
            </View>
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
    conteudo: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    cardPerfil: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
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
        marginTop: 2,
    },
    secao: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    itemInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    itemEsquerda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    labelInfo: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    valorInfo: {
        fontSize: 14,
        color: '#64748b',
    },
    botaoSair: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#fecaca',
        paddingVertical: 14,
        borderRadius: 12,
    },
    textoSair: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
});