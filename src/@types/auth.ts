export interface Usuario {
    id_usuario: number;
    nome: string;
    email: string;
}

export interface RespostaLogin {
    token: string;
    usuario: Usuario;
}

export interface AuthContextData {
    usuario: Usuario | null;
    token: string | null;
    carregando: boolean;
    login: (email: string, senha_hash: string) => Promise<void>;
    logout: () => void;
}