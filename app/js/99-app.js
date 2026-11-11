/* Laboratório — 99-app.js: liga as telas. O projeto escolhido lá em cima vale para TODAS as abas. */
(function (LB) {
  'use strict';
  const { $, $$, esc } = LB;
  let aba = 'projetos', ultimaCmp = null, planoCache = { id: '', md: '' };
  function opcoes(sel, vazio) { return (vazio ? '<option value="">— escolha —</option>' : '') + LB.projetos.map((p) => '<option value="' + p.id + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(p.nome) + '</option>').join(''); }
  function pintarSelects() {
    const a = LB.atual;
    $('#sel-a').innerHTML = LB.projetos.length ? opcoes(a) : '<option value="">(nenhum projeto ainda)</option>';
    const ca = LB.lembrado('cmpA') || a, cb = LB.lembrado('cmpB');
    $('#cmp-a').innerHTML = opcoes(LB.projeto(ca) ? ca : a, true); $('#cmp-b').innerHTML = opcoes(LB.projeto(cb) ? cb : '', true);
  }
  LB.escolher = (id) => { LB.atual = id; LB.lembrar('atual', id); pintarSelects(); pintar(); window.dispatchEvent(new CustomEvent('lab-projeto', { detail: id })); };
  function irAba(t) { aba = t; LB.lembrar('aba', t); $$('#abas .aba').forEach((b) => b.classList.toggle('on', b.dataset.t === t)); $$('main > section').forEach((s) => (s.hidden = s.dataset.p !== t)); pintar(); window.scrollTo(0, 0); window.dispatchEvent(new CustomEvent('lab-aba', { detail: t })); }
  LB.irAba = irAba;
  // o terminal trouxe arquivos novos: o plano precisa ser refeito
  window.addEventListener('lab-projeto-mudou', async () => { planoCache.id = ''; await LB.carregarProjetos(); pintarSelects(); pintar(); });
  $('#abas').onclick = (e) => { const b = e.target.closest('[data-t]'); if (b) irAba(b.dataset.t); };
  function pintarProjetos() {
    const el = $('#v-projetos');
    if (!LB.projetos.length) { el.innerHTML = '<p class="muted">Nenhum projeto ainda. Importe um aí em cima.</p>'; return; }
    el.innerHTML = LB.projetos.map((p) => {
      const n = Object.keys(p.arquivos).length, html = Object.keys(p.arquivos).filter((c) => /\.html?$/i.test(c)).length;
      return '<div class="proj' + (p.id === LB.atual ? ' on' : '') + '"><div class="nm">' + (p.id === LB.atual ? '👉 ' : '') + esc(p.nome) + '</div><div class="muted pequeno">' + n + ' arquivo(s) · ' + html + ' página(s) · ' + new Date(p.criado).toLocaleString('pt-BR') + '</div>' +
        '<div class="linha"><button class="btn s p" data-usar="' + p.id + '">Trabalhar neste</button><button class="btn s" data-plano="' + p.id + '">🗺️ Plano</button><button class="btn s" data-ca="' + p.id + '">⚖️ Usar como A</button><button class="btn s" data-cb="' + p.id + '">⚖️ Usar como B</button><button class="btn s" data-ren="' + p.id + '">✏️</button><button class="btn s" data-zip="' + p.id + '">⤓ .zip</button><button class="btn s d" data-del="' + p.id + '">🗑</button></div></div>';
    }).join('');
  }
  function pintarPlano() {
    const p = LB.projeto(LB.atual);
    if (!p) { $('#plano-nome').textContent = ''; $('#v-plano').innerHTML = '<p class="muted" style="padding:10px">Escolha ou importe um projeto lá em cima.</p>'; return; }
    $('#plano-nome').textContent = '🗺️ ' + p.nome;
    if (planoCache.id !== p.id) { $('#v-plano').innerHTML = '<p class="muted" style="padding:10px">Lendo o projeto…</p>'; setTimeout(() => { try { planoCache = { id: p.id, md: LB.planoMD(LB.analisar(p)) }; $('#v-plano').innerHTML = LB.mdParaHTML(planoCache.md); } catch (e) { $('#v-plano').innerHTML = '<p class="rm" style="padding:10px">⚠ ' + esc(e.message) + '</p>'; console.error(e); } }, 30); return; }
    $('#v-plano').innerHTML = LB.mdParaHTML(planoCache.md);
  }
  function pintar() { if (aba === 'projetos') pintarProjetos(); if (aba === 'plano') pintarPlano(); }
  $('#sel-a').onchange = (e) => LB.escolher(e.target.value);
  $('#cmp-a').onchange = (e) => LB.lembrar('cmpA', e.target.value); $('#cmp-b').onchange = (e) => LB.lembrar('cmpB', e.target.value);
  $('#b-importar').onclick = () => irAba('projetos');
  const rodar = (fn) => fn().catch((e) => LB.aviso('⚠ ' + e.message, 'erro'));
  $('#b-zip').onclick = () => $('#f-zip').click(); $('#b-pasta').onclick = () => $('#f-pasta').click(); $('#b-html').onclick = () => $('#f-html').click();
  $('#b-colar').onclick = () => rodar(LB.importarColado);
  $('#f-zip').onchange = (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) rodar(() => LB.importarCompactado(f)); };
  $('#f-pasta').onchange = (e) => { const fs = [...e.target.files]; e.target.value = ''; if (fs.length) rodar(() => LB.importarArquivos(fs, true)); };
  $('#f-html').onchange = (e) => { const fs = [...e.target.files]; e.target.value = ''; if (fs.length) rodar(() => LB.importarArquivos(fs, false)); };
  $('#v-projetos').addEventListener('click', (e) => rodar(async () => {
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.usar) LB.escolher(d.usar);
    if (d.plano) { LB.escolher(d.plano); irAba('plano'); }
    if (d.ca) { LB.lembrar('cmpA', d.ca); pintarSelects(); LB.aviso('A = ' + LB.projeto(d.ca).nome, 'ok'); }
    if (d.cb) { LB.lembrar('cmpB', d.cb); pintarSelects(); irAba('comparar'); }
    if (d.ren) { const p = LB.projeto(d.ren); const n = await LB.pedir('Novo nome:', p.nome); if (n && n.trim()) { p.nome = n.trim(); await LB.banco.salvar(p); planoCache.id = ''; pintarSelects(); pintar(); } }
    if (d.zip) { const p = LB.projeto(d.zip); const z = new JSZip(); for (const [c, r] of Object.entries(p.arquivos)) if (r.t != null) z.file(c, r.t); LB.baixar(p.nome.replace(/[^\wÀ-ÿ.-]+/g, '-') + '.zip', await z.generateAsync({ type: 'blob', compression: 'DEFLATE' })); }
    if (d.del) { const p = LB.projeto(d.del); if (await LB.confirmar('Apagar o projeto "' + p.nome + '" do Laboratório? (o arquivo original no seu celular não é apagado)', 'Apagar')) { await LB.banco.apagar(p.id); await LB.carregarProjetos(); if (LB.atual === p.id) LB.atual = LB.projetos[0] ? LB.projetos[0].id : null; pintarSelects(); pintar(); } }
  }));
  $('#b-plano-baixar').onclick = () => { if (planoCache.md) LB.baixar('PLANO-' + (LB.projeto(LB.atual) || {}).nome.replace(/[^\wÀ-ÿ.-]+/g, '-') + '.md', planoCache.md, 'text/markdown;charset=utf-8'); };
  $('#b-plano-copiar').onclick = () => { if (planoCache.md) LB.copiar(planoCache.md); };
  $('#cmp-esp').onchange = (e) => LB.setEspacos(e.target.checked);
  $('#b-cmp').onclick = () => {
    const a = LB.projeto($('#cmp-a').value), b = LB.projeto($('#cmp-b').value);
    if (!a || !b) return LB.aviso('Escolha o projeto A e o B.', 'erro'); if (a.id === b.id) return LB.aviso('A e B são o mesmo projeto.', 'erro');
    LB.lembrar('cmpA', a.id); LB.lembrar('cmpB', b.id);
    $('#v-cmp').innerHTML = '<p class="muted">Comparando…</p>';
    setTimeout(() => { try { ultimaCmp = LB.ultimaCmp = LB.comparar(a, b); LB.mostrarComparacao(ultimaCmp); } catch (e) { $('#v-cmp').innerHTML = '<p class="rm">⚠ ' + esc(e.message) + '</p>'; console.error(e); } }, 30);
  };
  $('#b-cmp-baixar').onclick = () => { if (ultimaCmp) LB.baixar('COMPARACAO-' + ultimaCmp.a.replace(/[^\wÀ-ÿ.-]+/g, '-') + '-x-' + ultimaCmp.b.replace(/[^\wÀ-ÿ.-]+/g, '-') + '.md', LB.comparacaoMD(ultimaCmp), 'text/markdown;charset=utf-8'); else LB.aviso('Compare primeiro.', 'erro'); };
  $('#b-cmp-copiar').onclick = () => { if (ultimaCmp) LB.copiar(LB.comparacaoMD(ultimaCmp)); else LB.aviso('Compare primeiro.', 'erro'); };
  (async () => { await LB.carregarProjetos(); const a = LB.lembrado('atual'); LB.atual = LB.projeto(a) ? a : (LB.projetos[0] ? LB.projetos[0].id : null); pintarSelects(); pintar(); const ab = LB.lembrado('aba'); if (ab && ab !== 'projetos' && LB.$('#abas [data-t="' + ab + '"]')) irAba(ab); })();
})(window.LB);

