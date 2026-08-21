import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/services/api';
import { Usuario, AuthContextData } from '../@types/auth';

const TOKEN_KEY = 'indigo_finance_token';
const USUARIO_KEY = 'indigo_finance_usuario';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarDadosSalvos() {
            try {
                const tokenSalvo = await SecureStore.getItemAsync(TOKEN_KEY);
                const usuarioSalvo = await SecureStore.getItemAsync(USUARIO_KEY);

                if (tokenSalvo && usuarioSalvo) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`;
                    setToken(tokenSalvo);
                    setUsuario(JSON.parse(usuarioSalvo));
                }
            } catch (error) {
                console.error('Erro ao carregar sessão salva:', error);
            } finally {
                setCarregando(false);
            }
        }

        carregarDadosSalvos();
    }, []);

    const login = async (email: string, senha: string) => {
        try {
            const emailFormatado = email.trim().toLowerCase();
            const senhaFormatada = senha.trim();

            const resposta = await api.post('/auth/login', {
                email: emailFormatado,
                senha: senhaFormatada,
                senha_hash: senhaFormatada,
            });

            const { token: tokenRecebido, usuario: usuarioRecebido, user } = resposta.data;
            const dadosUsuario = usuarioRecebido || user;

            api.defaults.headers.common['Authorization'] = `Bearer ${tokenRecebido}`;

            await SecureStore.setItemAsync(TOKEN_KEY, tokenRecebido);
            await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(dadosUsuario));

            setToken(tokenRecebido);
            setUsuario(dadosUsuario);
        } catch (error: any) {
            console.error('Erro detalhado no login:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USUARIO_KEY);
        } catch (error) {
            console.error('Erro ao remover dados de autenticação:', error);
        } finally {
            delete api.defaults.headers.common['Authorization'];
            setToken(null);
            setUsuario(null);
        }
    };

    return (
        <AuthContext.Provider value={{ usuario, token, carregando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);