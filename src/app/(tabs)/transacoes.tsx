import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search,
    TrendingUp,
    TrendingDown,
    Plus,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Calendar,
    ReceiptText,
    Trash2,
    Edit2,
    CreditCard,
} from 'lucide-react-native';
import { ModalTransacao, TransacaoItem } from '@/components/ModalTransacao';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function TransacoesScreen() {
    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [transacoes, setTransacoes] = useState<TransacaoItem[]>([]);
    const [carregando, setCarregando] = useState(true); 
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<'todas' | 'receitas' | 'despesas'>('todas'); // Pode ser no estado: 'todas' | 'receitas' | 'despesas'
    
    const [modalAberto, setModalAberto] = useState(false);
    const [trasacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoItem | null>(null);

    function formatarMoeda(valor: number | string){
        const numero = Math.abs(Number(valor)) || 0;
        return numero.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
        });
    }

    function extrairTipoNormalizado(item: TransacaoItem): 'receita' | 'despesa' {
        const raw = String(item.tipo || item.tipo_transacao || item.categoria.tipo || '').toLowerCase();
        return raw.includes('rec') ? 'receita' : 'despesa';
    }

    function formatarDataHora(item: any): string {
        const raw = item.data || item.data_trasacao || item.created_at || item.criado_em;
        if (!raw) return '';

        try {
            const partes = String(raw).split('T')[0].split('-');
            if (partes.length === 3){
                return `${partes[2]}/${partes[1]}`;
            }

            const dataObj = new Date(raw);
            if (isNaN(dataObj.getTime())) return '';
            return dataObj.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
        } catch {
            return '';
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Extrato de Transações</Text>
                <Text style={styles.subtitulo}>Histórico completo de entradas e saídas</Text>
            </View>

            {/* Seletor de Mês e Ano */}
            <View style={styles.containerSeletorMes}>
                <TouchableOpacity
                    style={styles.botaoSetaMes}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={20} color="#475569" />
                </TouchableOpacity>

                <View style={styles.boxMesTexto}>
                    <Calendar size={15} color="#4f46e5" />
                    <Text style={styles.textoMesExtenso}>Setembro de 2026</Text>
                </View>

                <TouchableOpacity
                    style={styles.botaoSetaMes}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronRight size={20} color="#475569" />
                </TouchableOpacity>
            </View>

            {/* Caixa de Busca */}
            <View style={styles.boxBusca}>
                <Search size={18} color="#94a3b8" />
                <TextInput
                    style={styles.inputBusca}
                    placeholder="Buscar global por nome, categoria..."
                    placeholderTextColor="#94a3b8"
                    editable={false}
                />
            </View>

            {/* Filtro por tags */}
            <View style={styles.abasContainer}>
                <TouchableOpacity style={[styles.aba, styles.abaAtiva]}>
                    <ArrowUpDown size={14} color="#ffffff" />
                    <Text style={[styles.textoAba, styles.textoAbaAtiva]}>Todas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.aba}>
                    <TrendingUp size={14} color="#10b981" />
                    <Text style={styles.textoAba}>Receitas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.aba}>
                    <TrendingDown size={14} color="#ef4444" />
                    <Text style={styles.textoAba}>Despesas</Text>
                </TouchableOpacity>
            </View>

            {/* Conteúdo Central Demonstrativo */}
            <ScrollView contentContainerStyle={styles.conteudoCentral}>
                <View style={styles.cardDemonstracao}>
                    <View style={styles.iconePlaceholder}>
                        <ReceiptText size={32} color="#4f46e5" />
                    </View>
                    <Text style={styles.tituloCardDemo}>Módulo de Transações</Text>
                    <Text style={styles.textoCardDemo}>
                        Painel de visualização e filtros configurado. Toque no botão flutuante abaixo para conferir o modal de lançamentos.
                    </Text>
                </View>
            </ScrollView>

            {/* Botão Flutuante (+) - Abre o Modal */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalAberto(true)}
                activeOpacity={0.85}
            >
                <Plus color="#ffffff" size={28} />
            </TouchableOpacity>

            {/* Modal de Transação (Modo Visual) */}
            <ModalTransacao
                visivel={modalAberto}
                aoFechar={() => setModalAberto(false)}
                aoSalvarSucesso={() => setModalAberto(false)}
            />
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
        paddingBottom: 10,
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
    containerSeletorMes: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    botaoSetaMes: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxMesTexto: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    textoMesExtenso: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    boxBusca: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginHorizontal: 20,
        marginBottom: 12,
        gap: 8,
    },
    inputBusca: {
        flex: 1,
        fontSize: 14,
        color: '#0f172a',
    },
    abasContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    aba: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#ffffff',
    },
    abaAtiva: {
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
    },
    textoAba: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    textoAbaAtiva: {
        color: '#ffffff',
    },
    conteudoCentral: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    cardDemonstracao: {
        backgroundColor: '#ffffff',
        padding: 28,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    iconePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#ede9fe',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    tituloCardDemo: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
    },
    textoCardDemo: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
    },
});