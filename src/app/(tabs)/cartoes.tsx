import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Cartoes() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.titulo}>Meus Cartões</Text>
            <Text style={styles.subtitulo}>Gerencie seus cartões de crédito e limites.</Text>
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