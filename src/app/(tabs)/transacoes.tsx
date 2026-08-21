import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Transacoes() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.titulo}>Extrato de Transações</Text>
            <Text style={styles.subtitulo}>Aqui você verá receitas e despesas detalhadas.</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf8ff',
        padding: 20,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitulo: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 6,
    },
});