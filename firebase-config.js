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

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyB9HEWiHFc8YEuj_Ab-7TxGKqdQkSRQAio",
  authDomain:        "assent-2b945.firebaseapp.com",
  projectId:         "assent-2b945",
  storageBucket:     "assent-2b945.firebasestorage.app",
  messagingSenderId: "851051401705",
  appId:             "1:851051401705:web:fa6ebb1cc6ee5d3a737b78"
};

// Expõe globalmente para o admin-cursos.html
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
