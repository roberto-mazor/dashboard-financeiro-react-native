import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const TOKEN_KEY = 'indigo_finance_token';

export const api = axios.create({
    baseURL: 'https://seu-backend.vercel.app/api', // Substitua pela sua URL base
    timeout: 10000,
});

// Injeta o token em todas as requisições
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Erro ao ler token no storage:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepta respostas 401 (token inválido ou expirado)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn('Sessão expirada. Redirecionando para login...');
            try {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
            } catch (e) {
                console.error('Erro ao remover token expirado:', e);
            }
            // Redireciona para a tela de autenticação
            router.replace('/login');
        }
        return Promise.reject(error);
    }
);