/* Laboratório — 75-memoria.js: 📒 MEMÓRIA — o caderno de cada projeto (e um caderno geral).
   O que é o projeto, o que já funciona, o que falta, as decisões e os erros já resolvidos.
   Salva sozinho enquanto você escreve (fica guardado neste aparelho, neste navegador).
   📎 manda para a 🤖 IA junto com a pergunta, para ela não se perder. */
(function (LB) {
  'use strict';
  const { $, esc } = LB;
  const MODELO = '# Memória do projeto\n\n## Objetivo (o que ele deve fazer)\n- \n\n## Já funciona\n- \n\n## Falta fazer / está quebrado\n- \n\n## Decisões (o que escolhi e por quê)\n- \n\n## Erros que já resolvi (e como)\n- \n';
  const chave = (id) => 'lab2:mem:' + id;
  const ler = (id) => { try { return localStorage.getItem(chave(id)) || ''; } catch { return ''; } };
  const gravar = (id, t) => { try { localStorage.setItem(chave(id), t); localStorage.setItem(chave(id) + ':quando', String(Date.now())); return true; } catch { return false; } };
  let qual = 'projeto', t = 0;
  const idAtual = () => qual === 'geral' ? '__geral__' : LB.atual;

  function tela() {
    const el = $('#panel-memoria'); if (!el) return;
    const p = LB.projeto(LB.atual);
    const id = idAtual();
    if (qual === 'projeto' && !p) { el.innerHTML = '<div class="card"><p class="muted">Escolha ou importe um projeto lá em cima. (Ou use o <button class="btn s" data-mem="geral">📒 Caderno geral</button>.)</p></div>'; return; }
    const texto = ler(id);
    const quando = Number((() => { try { return localStorage.getItem(chave(id) + ':quando'); } catch { return 0; } })() || 0);
    el.innerHTML =
      '<div class="card"><div class="linha">' +
      '<button class="btn s' + (qual === 'projeto' ? ' p' : '') + '" data-mem="projeto">📂 Deste projeto' + (p ? ': ' + esc(p.nome) : '') + '</button>' +
      '<button class="btn s' + (qual === 'geral' ? ' p' : '') + '" data-mem="geral">📒 Caderno geral (vale para todos)</button>' +
      '<span class="cresce"></span><span class="muted pequeno" id="mem-salvo">' + (quando ? '💾 salvo ' + new Date(quando).toLocaleString('pt-BR') : '') + '</span></div>' +
      '<p class="muted pequeno">Escreva (ou dite pelo teclado do celular). Salva sozinho. Use para a IA não se perder: o que é o projeto, o que já funciona, o que falta, as decisões.</p>' +
      '<textarea id="mem-texto" class="mem-texto" spellcheck="true" placeholder="Toque em 📝 Modelo para começar com os títulos.">' + esc(texto) + '</textarea>' +
      '<div class="linha">' + (texto.trim() ? '' : '<button class="btn s" data-mem="modelo">📝 Modelo</button>') +
      '<button class="btn s p" data-mem="ia">📎 Mandar para a 🤖 IA</button><button class="btn s" data-mem="copiar">📋 Copiar</button><button class="btn s" data-mem="baixar">⤓ Baixar (.md)</button><button class="btn s" data-mem="abrir">⤒ Abrir um .md</button>' +
      '<input type="file" id="mem-arq" accept=".md,.txt,text/*" hidden></div></div>';
    const ta = $('#mem-texto');
    ta.oninput = () => { clearTimeout(t); t = setTimeout(() => { const ok = gravar(id, ta.value); const s = $('#mem-salvo'); if (s) s.textContent = ok ? '💾 salvo agora' : '⚠ não consegui salvar (memória do navegador cheia?)'; }, 500); };
    $('#mem-arq').onchange = async (e) => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; const txt = await f.text(); ta.value = ta.value.trim() ? ta.value + '\n\n' + txt : txt; ta.oninput(); };
  }
  document.addEventListener('click', (e) => {
    const el = $('#panel-memoria'); if (!el || !el.contains(e.target)) return;
    const b = e.target.closest('[data-mem]'); if (!b) return;
    const a = b.dataset.mem, ta = $('#mem-texto'), p = LB.projeto(LB.atual);
    if (a === 'projeto' || a === 'geral') { qual = a; return tela(); }
    if (a === 'modelo' && ta) { ta.value = MODELO.replace('# Memória do projeto', qual === 'geral' ? '# Caderno geral (vale para todos os projetos)' : '# Memória do projeto ' + (p ? p.nome : '')); ta.oninput(); b.remove(); }
    if (a === 'copiar' && ta) LB.copiar(ta.value);
    if (a === 'baixar' && ta) LB.baixar('MEMORIA-' + (qual === 'geral' ? 'geral' : (p ? p.nome : 'projeto')).replace(/[^\wÀ-ÿ.-]+/g, '-') + '.md', ta.value, 'text/markdown;charset=utf-8');
    if (a === 'abrir') $('#mem-arq').click();
    if (a === 'ia' && ta) {
      if (!ta.value.trim()) return LB.aviso('A memória está vazia.', 'erro');
      const geral = qual === 'projeto' ? ler('__geral__') : '';
      LB.irAba('ia');
      setTimeout(() => LB.ia.colar(qual === 'geral' ? 'Caderno geral' : 'Memória do projeto "' + (p ? p.nome : '') + '"', ta.value + (geral.trim() ? '\n\n## Caderno geral\n' + geral : '')), 50);
    }
  });
  window.addEventListener('lab-aba', (e) => { if (e.detail === 'memoria') tela(); });
  window.addEventListener('lab-projeto', () => { const el = $('#panel-memoria'); if (el && !el.closest('section').hidden) tela(); });
  LB.memoria = { texto: (id) => ler(id) + (id !== '__geral__' && ler('__geral__').trim() ? '\n\n## Caderno geral\n' + ler('__geral__') : ''), ler, gravar };
})(window.LB);
