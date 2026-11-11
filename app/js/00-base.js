/* Laboratório — 00-base.js: peças comuns (LB). */
(function () {
  'use strict';
  const LB = window.LB = { projetos: [], atual: null };
  LB.$ = (s, r) => (r || document).querySelector(s);
  LB.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  LB.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  LB.kb = (n) => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1).replace('.', ',') + ' KB' : (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
  let t = 0;
  LB.aviso = (txt, tipo) => { const el = LB.$('#aviso'); el.textContent = txt; el.className = 'aviso ' + (tipo || ''); el.hidden = false; clearTimeout(t); t = setTimeout(() => { el.hidden = true; }, tipo === 'erro' ? 7000 : 3500); };
  LB.modal = (html, fim, ini) => {
    const w = document.createElement('div'); w.className = 'modal'; w.innerHTML = '<div>' + html + '</div>'; document.body.appendChild(w);
    if (ini) ini(w);
    w.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b && e.target !== w) return; const x = b ? b.dataset.x : '0'; w.remove(); fim(w, x); });
  };
  LB.pedir = (titulo, valor, grande) => new Promise((ok) => LB.modal('<h2>' + LB.esc(titulo) + '</h2>' + (grande ? '<textarea id="pd" rows="12" style="width:100%"></textarea>' : '<input type="text" id="pd" style="width:100%">') + '<div class="linha" style="justify-content:flex-end"><button class="btn" data-x="0">Cancelar</button><button class="btn p" data-x="1">OK</button></div>',
    (w, x) => ok(x === '1' ? LB.$('#pd', w).value : null), (w) => { const i = LB.$('#pd', w); i.value = valor || ''; setTimeout(() => i.focus(), 30); }));
  LB.confirmar = (texto, sim) => new Promise((ok) => LB.modal('<p>' + LB.esc(texto) + '</p><div class="linha" style="justify-content:flex-end"><button class="btn" data-x="0">Cancelar</button><button class="btn p" data-x="1">' + LB.esc(sim || 'Sim') + '</button></div>', (w, x) => ok(x === '1')));
  LB.baixar = (nome, dados, tipo) => {
    const blob = dados instanceof Blob ? dados : new Blob([dados], { type: tipo || 'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    LB.aviso('⤓ ' + nome, 'ok');
  };
  LB.copiar = async (texto) => { try { await navigator.clipboard.writeText(texto); LB.aviso('📋 Copiado', 'ok'); } catch { LB.pedir('Copie daqui:', texto, true); } };
  LB.ehTexto = (r) => r && r.t != null;
})();

