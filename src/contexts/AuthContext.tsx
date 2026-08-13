import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/services/api';
import { Usuario, AuthContextData } from '../@types/auth';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarDadosSalvos() {
            try {
                const tokenSalvo = await SecureStore.getItemAsync('@IndigoFinance:token');
                const usuarioSalvo = await SecureStore.getItemAsync('@IndigoFinance:usuario');

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

    const login = async (email: string, senha_hash: string) => {
        // Rota de login configurada na sua API
        const resposta = await api.post('/auth/login', { email, senha_hash });
        const { token: tokenRecebido, usuario: usuarioRecebido } = resposta.data;

        setToken(tokenRecebido);
        setUsuario(usuarioRecebido);

        // Injeta o token padrão nas requisições do Axios
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenRecebido}`;

        // Salva no dispositivo
        await SecureStore.setItemAsync('@IndigoFinance:token', tokenRecebido);
        await SecureStore.setItemAsync('@IndigoFinance:usuario', JSON.stringify(usuarioRecebido));
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('@IndigoFinance:token');
        await SecureStore.deleteItemAsync('@IndigoFinance:usuario');

        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, token, carregando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);