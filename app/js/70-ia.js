/* Laboratório — 70-ia.js: 🤖 IA — o MEU CHAT aqui dentro (chat livre, do jeito da última versão):
   as suas chaves (Gemini, Groq, OpenRouter…), o 🦙 Ollama sozinho quando estiver ligado,
   voz natural, memória, internet e fotos.
   Os botões 📎 colocam na caixa do chat o PLANO do projeto, a MEMÓRIA dele, a COMPARAÇÃO A × B
   ou um ARQUIVO — aí é só perguntar (escrevendo ou pelo 🎤). */
(function (LB) {
  'use strict';
  const { $, esc } = LB;
  let pronto = false, fila = [], montado = false;
  const quadro = () => $('#ia-quadro');
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || !e.data.labChatPronto) return;
    pronto = true; const f = fila; fila = []; f.forEach(mandar);
  });
  function mandar(msg) {
    const q = quadro();
    if (!q || !pronto) { fila.push(msg); return; }
    q.contentWindow.postMessage({ labMsg: msg }, location.origin);
  }
  // 🔒 chaves e senhas que aparecerem no texto vão escondidas para a IA
  const esconderChaves = (t) => String(t || '').replace(/\b(AIza[0-9A-Za-z_\-]{20,}|AQ\.[0-9A-Za-z_\-]{20,}|sk-(?:ant-|proj-|or-v1-)?[0-9A-Za-z_\-]{16,}|gsk_[0-9A-Za-z]{20,}|ghp_[0-9A-Za-z]{20,}|github_pat_[0-9A-Za-z_]{20,}|xai-[0-9A-Za-z]{20,}|pplx-[0-9A-Za-z]{20,}|eyJ[0-9A-Za-z_\-]{20,}\.[0-9A-Za-z_\-]{10,}\.[0-9A-Za-z_\-]{10,})/g, (k) => k.slice(0, 4) + '•••(escondida)')
    .replace(/(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/gi, '$1•••@');
  function colar(titulo, texto) {
    texto = esconderChaves(texto); const n = texto.length;
    const aviso = n > 60000 ? '\n\n(⚠ texto grande: ' + Math.round(n / 1000) + ' mil letras — o 🦙 Ollama pequeno pode não aguentar tudo; o Gemini aguenta)' : '';
    mandar({ texto: '### ' + titulo + '\n\n' + texto + aviso + '\n\n---\nMinha pergunta: ', juntar: true });
    LB.aviso('📎 ' + titulo + ' foi para a caixa do chat. Agora é só perguntar.', 'ok');
  }
  function tela() {
    const el = $('#panel-ia'); if (!el || montado) return;
    montado = true;
    el.innerHTML =
      '<div class="card ia-barra"><div class="linha"><b>🤖 IA</b><span class="muted pequeno" id="ia-proj"></span><span class="cresce"></span>' +
      '<button class="btn s" data-ia="plano">📎 Plano do projeto</button><button class="btn s" data-ia="memoria">📎 Memória</button><button class="btn s" data-ia="cmp">📎 Comparação A × B</button><button class="btn s" data-ia="arquivo">📎 Um arquivo</button><button class="btn s" data-ia="fora">↗ Tela própria</button></div>' +
      '<p class="muted pequeno">É o seu <b>Meu Chat</b> aqui dentro: as suas chaves, o 🦙 Ollama (aparece sozinho quando está ligado), 🎤 voz, 🌐 internet, 📷 fotos e memória. As chaves e conversas são as do Meu Chat deste endereço; traga as chaves pelo ⚙️ → 🔐 Cofre dele.</p></div>' +
      '<iframe id="ia-quadro" class="ia-quadro" title="Meu Chat" src="ferramentas/meu-chat/index.html" allow="microphone; camera; clipboard-read; clipboard-write; autoplay; fullscreen"></iframe>';
    pintarNome();
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-ia]'); if (b) acao(b.dataset.ia).catch((er) => LB.aviso('⚠ ' + er.message, 'erro')); });
  }
  function pintarNome() { const p = LB.projeto(LB.atual); const s = $('#ia-proj'); if (s) s.textContent = p ? '· projeto: ' + p.nome : '· (nenhum projeto escolhido)'; }
  async function acao(qual) {
    const p = LB.projeto(LB.atual);
    if (qual === 'fora') return window.open('ferramentas/meu-chat/index.html', '_blank');
    if (!p) throw new Error('Escolha o projeto lá em cima primeiro.');
    if (qual === 'plano') { LB.aviso('Lendo o projeto…'); await new Promise((r) => setTimeout(r, 30)); return colar('Plano do projeto "' + p.nome + '"', LB.planoMD(LB.analisar(p))); }
    if (qual === 'memoria') { const t = LB.memoria ? LB.memoria.texto(p.id) : ''; if (!t.trim()) throw new Error('A memória deste projeto está vazia (aba 📒 Memória).'); return colar('Memória do projeto "' + p.nome + '"', t); }
    if (qual === 'cmp') { if (!LB.ultimaCmp) throw new Error('Compare primeiro (aba ⚖️ Comparar A × B).'); return colar('Comparação ' + LB.ultimaCmp.a + ' (funciona) × ' + LB.ultimaCmp.b + ' (quebrado)', LB.comparacaoMD(LB.ultimaCmp)); }
    if (qual === 'arquivo') {
      const nomes = Object.keys(p.arquivos).filter((c) => p.arquivos[c] && p.arquivos[c].t != null).sort();
      LB.modal('<h2>📎 Qual arquivo?</h2><input type="text" id="ia-busca" placeholder="Procurar…" style="width:100%"><div id="ia-lista" class="ia-lista"></div><div class="linha" style="justify-content:flex-end"><button class="btn" data-x="0">Fechar</button></div>',
        () => {}, (w) => {
          const lista = $('#ia-lista', w), busca = $('#ia-busca', w);
          const pintar = () => { const q = busca.value.toLowerCase(); lista.innerHTML = nomes.filter((n) => n.toLowerCase().includes(q)).slice(0, 200).map((n) => '<button class="btn s ia-arq" data-x="arq" data-nome="' + esc(n) + '">' + esc(n) + ' <span class="muted pequeno">' + LB.kb(p.arquivos[n].t.length) + '</span></button>').join('') || '<p class="muted">Nada.</p>'; };
          busca.oninput = pintar; pintar();
          lista.addEventListener('click', (ev) => { const b = ev.target.closest('[data-nome]'); if (b) colar('Arquivo ' + b.dataset.nome + ' (projeto "' + p.nome + '")', '```\n' + p.arquivos[b.dataset.nome].t + '\n```'); });
        });
    }
  }
  window.addEventListener('lab-aba', (e) => { if (e.detail === 'ia') { tela(); pintarNome(); } });
  window.addEventListener('lab-projeto', pintarNome);
  LB.ia = { colar, tela };
})(window.LB);
