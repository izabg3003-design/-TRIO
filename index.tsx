
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('Átrio: Iniciando boot do componente principal...');

const container = document.getElementById('root');

if (!container) {
    const err = "Erro Fatal: Elemento #root não encontrado no DOM.";
    console.error(err);
    document.body.innerHTML = `<div style="color:red; padding:20px; font-family:sans-serif;">${err}</div>`;
} else {
    try {
        const root = createRoot(container);
        root.render(<App />);
        console.log('Átrio: React renderizado com sucesso.');
    } catch (e) {
        console.error('Átrio: Falha ao renderizar App:', e);
        throw e;
    }
}
