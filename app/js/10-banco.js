/* Laboratório — 10-banco.js: os projetos guardados no aparelho (IndexedDB), cada um SEPARADO e com nome.
   Projeto = { id, nome, criado, origem, arquivos: { caminho: { t: texto } | { b: tamanho-binário } } } */
(function (LB) {
  'use strict';
  let db = null;
  const abrir = () => db ? Promise.resolve(db) : new Promise((ok, erro) => {
    const r = indexedDB.open('laboratorio-2', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('projetos', { keyPath: 'id' });
    r.onsuccess = () => { db = r.result; ok(db); }; r.onerror = () => erro(r.error);
  });
  const tx = async (modo, fn) => { const d = await abrir(); return new Promise((ok, erro) => { const t = d.transaction('projetos', modo); const s = t.objectStore('projetos'); const r = fn(s); t.oncomplete = () => ok(r && r.result); t.onerror = () => erro(t.error); }); };
  LB.banco = {
    todos: async () => (await tx('readonly', (s) => s.getAll())) || [],
    salvar: (p) => tx('readwrite', (s) => s.put(p)),
    apagar: (id) => tx('readwrite', (s) => s.delete(id)),
  };
  LB.carregarProjetos = async () => { LB.projetos = (await LB.banco.todos()).sort((a, b) => b.criado - a.criado); return LB.projetos; };
  LB.projeto = (id) => LB.projetos.find((p) => p.id === id) || null;
  LB.novoId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  // o que fica escolhido (A e B) é lembrado
  LB.lembrar = (k, v) => { try { localStorage.setItem('lab2:' + k, v || ''); } catch {} };
  LB.lembrado = (k) => { try { return localStorage.getItem('lab2:' + k) || ''; } catch { return ''; } };
})(window.LB);

