import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://dashboard-financeiro-projeto-pi-bac.vercel.app/api',
});