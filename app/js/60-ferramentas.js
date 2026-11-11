/* Laboratório — 60-ferramentas.js: 🧰 AS SUAS FERRAMENTAS NUM LUGAR SÓ.
   Cada ferramenta é um HTML que funciona sozinho (pasta ferramentas/). Abre aqui dentro
   e continua guardando os próprios dados. "↗ Tela própria" abre numa aba só dela. */
(function (LB) {
  'use strict';
  const { $, esc } = LB;
  const FERR = [
    { id: 'montador', icone: '🧩', nome: 'Montador Universal', arq: 'montador.html', desc: 'Abre qualquer arquivo (PDF, Word, Excel…) e cria modelos de regras por linha.' },
    { id: 'picotador', icone: '✂️', nome: 'Picotador de Memória', arq: 'picotador.html', desc: 'Corta e divide memórias, backups e conversas grandes em pedaços.' },
    { id: 'faxina', icone: '🧹', nome: 'Faxina de Repetidos', arq: 'faxina.html', desc: 'Tira arquivos repetidos de zips e pastas, dá nome pelo título e separa por tipo.' },
    { id: 'arrumador', icone: '🗃', nome: 'Arrumador de Backups', arq: 'arrumador.html', desc: 'Junta backups (Jurídico, Colador, memórias do Mini SK), separa por projeto/data.' },
    { id: 'numerador', icone: '🔢', nome: 'Numerador de Códigos', arq: 'numerador.html', desc: 'Junta muitos HTML, tira repetidos e parecidos, e baixa numerados com índice.' },
    { id: 'preparador', icone: '🧰', nome: 'Preparador Universal', arq: 'preparador.html', desc: 'Prepara qualquer projeto (até monorepo do Replit) para .exe, APK e Netlify.' },
    { id: 'colador', icone: '🔗', nome: 'Colador de Links', arq: 'colador.html', desc: 'Guarda e abre os links das suas versões, com dois visores e exportar em MD.' },
    { id: 'meuchat', icone: '💬', nome: 'Meu Chat (tela inteira)', arq: 'meu-chat/index.html', desc: 'O seu chat com as suas chaves, 🦙 Ollama, voz, memória, internet e fotos. (Também está na aba 🤖 IA.)' },
  ];
  // os códigos que você trouxe (feitos pelo Claude antigo / outras IAs) — do jeito que vieram
  const SEUS = [
    { id: 'aistudio', icone: '🤖', nome: 'AI Code Studio', arq: 'ai-code-studio.html', desc: 'Chat com várias IAs, memória e editor de código.' },
    { id: 'projetolab', icone: '🧪', nome: 'Projeto Lab', arq: 'projeto-lab.html', desc: 'O laboratório antigo do Claude.' },
    { id: 'replicador', icone: '🧬', nome: 'Replicador de Projeto', arq: 'replicador.html', desc: 'Replica a estrutura de um projeto.' },
    { id: 'iara', icone: '🌊', nome: 'Iara Suite', arq: 'iara-suite.html', desc: 'Code Editor · APK Builder · Site Extractor.' },
    { id: 'juntador', icone: '🧷', nome: 'Juntador de Arquivos', arq: 'juntador.html', desc: 'Junta arquivos.' },
  ];
  const KITS = [
    { icone: '📦', nome: 'Kit do Replit', arq: 'kit-replit.cjs', desc: 'Roda dentro do Replit: relatório, pacote limpo, build. Shell: node kit-replit.cjs 5' },
    { icone: '🟢', nome: 'Servidorzinho', arq: 'servir.py', desc: 'Abre qualquer app montado como o Replit abre. PC ou Termux: python servir.py' },
    { icone: '📱', nome: 'Organizador do Celular', arq: 'organizar.py', desc: 'Termux: acha repetidos no celular inteiro; só apaga quando você escreve APAGAR.' },
    { icone: '🧩', nome: 'Juntar', arq: 'juntar.py', desc: 'Transforma um projeto em pedaços (index + css + js) num HTML único.' },
  ];
  let aberta = '';
  const el = () => $('#panel-ferramentas');
  const achar = (id) => FERR.concat(SEUS).find((x) => x.id === id);
  const cartao = (f) => '<button class="ferr-card" data-abrir="' + f.id + '"><span class="ferr-ic">' + f.icone + '</span><b>' + esc(f.nome) + '</b><small>' + esc(f.desc) + '</small></button>';

  function tela() {
    const e = el(); if (!e) return;
    if (aberta) return abrir(aberta);
    e.innerHTML =
      '<div class="card"><h2>🧰 Ferramentas</h2><p class="muted">As suas ferramentas, todas aqui dentro. Cada uma guarda os próprios dados.</p></div>' +
      '<div class="ferr-grade">' + FERR.map(cartao).join('') + '</div>' +
      '<h3 class="ferr-grupo">📂 Seus códigos (do jeito que vieram)</h3>' +
      '<div class="ferr-grade">' + SEUS.map(cartao).join('') + '</div>' +
      '<h3 class="ferr-grupo">🧳 Kits para baixar (rodam fora do navegador)</h3>' +
      '<div class="ferr-kits">' + KITS.map((k) => '<div class="ferr-kit"><span class="ferr-ic">' + k.icone + '</span><div><b>' + esc(k.nome) + '</b> <code>' + esc(k.arq) + '</code><br><small class="muted">' + esc(k.desc) + '</small></div><button class="btn s" data-kit="' + esc(k.arq) + '">⤓ Baixar</button></div>').join('') + '</div>';
  }
  function abrir(id) {
    const f = achar(id); if (!f) { aberta = ''; return tela(); }
    aberta = id;
    el().innerHTML = '<div class="linha ferr-barra"><button class="btn" data-voltar="1">← Ferramentas</button><b>' + f.icone + ' ' + esc(f.nome) + '</b><span class="cresce"></span><button class="btn s" data-propria="' + f.id + '">↗ Tela própria</button></div>' +
      '<iframe class="ferr-quadro" title="' + esc(f.nome) + '" src="ferramentas/' + f.arq + '" allow="microphone; camera; clipboard-read; clipboard-write; fullscreen; autoplay; web-share"></iframe>';
  }
  async function kit(arq) {
    try {
      const r = await fetch('kits/' + arq); if (!r.ok) throw new Error('não achei ' + arq);
      LB.baixar(arq, await r.blob());
    } catch (e) { LB.aviso('⚠ ' + e.message + ' (abra o Laboratório publicado ou pelo Mini SK)', 'erro'); }
  }
  document.addEventListener('click', (e) => {
    const box = el(); if (!box || !box.contains(e.target)) return;
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.abrir) abrir(b.dataset.abrir);
    if (b.dataset.voltar) { aberta = ''; tela(); }
    if (b.dataset.propria) window.open('ferramentas/' + achar(b.dataset.propria).arq, '_blank');
    if (b.dataset.kit) kit(b.dataset.kit);
  });
  window.addEventListener('lab-aba', (e) => { if (e.detail === 'ferramentas' && !el().innerHTML) tela(); });
  LB.ferramentas = { tela, abrir, lista: FERR.concat(SEUS) };
})(window.LB);
