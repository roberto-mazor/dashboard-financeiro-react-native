

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'indigo_finance_token';

export const api = axios.create({
    baseURL: 'https://dashboard-financeiro-projeto-pi-bac.vercel.app/api',
    timeout: 10000,
});

// Interceptor para injetar o token JWT automaticamente em todas as chamadas
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Erro ao ler token no interceptor:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);