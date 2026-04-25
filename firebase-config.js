/**
 * firebase-config.js — ASSENT Agência
 * ─────────────────────────────────────
 * Configuração central do Firebase.
 *
 * INSTRUÇÃO: Substitua os valores abaixo com as credenciais
 * do seu projeto Firebase (Console → Configurações do projeto → Seus apps).
 *
 * Este arquivo é importado pelo admin-cursos.html (via <script src>).
 * Para cursos.html e curso.html, o Firebase já é inicializado via navbar.js.
 *
 * ⚠️  NUNCA versione este arquivo com credenciais reais em repositórios públicos.
 */

// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";

const firebaseConfig = {
  apiKey: "%%FIREBASE_API_KEY%%",
  authDomain: "%%FIREBASE_AUTH_DOMAIN%%",
  projectId: "%%FIREBASE_PROJECT_ID%%",
  storageBucket: "%%FIREBASE_STORAGE_BUCKET%%",
  messagingSenderId: "%%FIREBASE_MESSAGING_SENDER_ID%%",
  appId: "%%FIREBASE_APP_ID%%"
};

export const app = initializeApp(firebaseConfig);

// Expõe globalmente para o admin-cursos.html
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
