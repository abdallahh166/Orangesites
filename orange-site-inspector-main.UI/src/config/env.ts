// src/config/env.ts

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production'; 