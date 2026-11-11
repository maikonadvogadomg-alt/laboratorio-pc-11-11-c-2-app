/* Laboratório — 40-plano.js: o PLANO MACRO do projeto, em .md (para ler aqui e para levar para a IA). */
(function (LB) {
  'use strict';
  const T = { html: '📄 página', js: '⚙️ código', ts: '⚙️ código (TS/JSX)', css: '🎨 estilo', json: '🧾 dados/config', texto: '📝 texto', imagem: '🖼 imagem', outro: '📦 outro' };
  function arvore(lista) {
    const raiz = {}; for (const a of lista) { let no = raiz; const ps = a.caminho.split('/'); ps.forEach((p, i) => { if (i === ps.length - 1) no[p] = a; else no = no[p + '/'] = no[p + '/'] || {}; }); }
    const out = []; (function andar(no, pre) { const ks = Object.keys(no).sort((a, b) => (b.endsWith('/') - a.endsWith('/')) || a.localeCompare(b)); ks.forEach((k, i) => { const ult = i === ks.length - 1; const v = no[k]; out.push(pre + (ult ? '└─ ' : '├─ ') + k + (k.endsWith('/') ? '' : '  (' + (v.linhas ? v.linhas + ' linhas' : LB.kb(v.tam || 0)) + ')')); if (k.endsWith('/')) andar(v, pre + (ult ? '   ' : '│  ')); }); })(raiz, '');
    return out.join('\n');
  }
  LB.planoMD = (R) => {
    const L = []; const graves = R.problemas.filter((p) => p.grave), avisos = R.problemas.filter((p) => !p.grave);
    const pj = R.pacote;
    const tipo = pj ? (pj.dependencies && (pj.dependencies.react || (pj.devDependencies || {}).react) ? 'app React' : 'app Node/npm') + (R.rotas.length ? ' com servidor (' + R.rotas.length + ' rotas)' : '') : R.paginas.length === 1 && R.arquivos.length === 1 ? 'HTML único (tudo num arquivo)' : 'HTML modular (' + R.paginas.length + ' página(s), ' + R.codigos.filter((c) => !c.pagina).length + ' arquivo(s) de código)';
    L.push('# 🗺️ Plano macro — ' + R.nome, '', '> Gerado pelo 🔬 Laboratório em ' + new Date().toLocaleString('pt-BR') + '.', '');
    L.push('## 1. Resumo', '', '- **Tipo:** ' + tipo, '- **Arquivos:** ' + R.arquivos.length + ' (' + Object.entries(R.arquivos.reduce((o, a) => (o[a.tipo] = (o[a.tipo] || 0) + 1, o), {})).map(([k, v]) => v + ' ' + (T[k] || k)).join(', ') + ')', '- **Funções encontradas:** ' + R.funcoes.length, '- **Problemas:** ' + graves.length + ' grave(s) 🔴 · ' + avisos.length + ' aviso(s) 🟡', '');
    if (graves.length) L.push('**O mais importante agora:** ' + graves[0].texto, '');
    L.push('## 2. Mapa dos arquivos', '', '```', arvore(R.arquivos), '```', '');
    if (R.paginas.length) {
      L.push('## 3. Como cada página carrega (a ordem importa)', '');
      for (const pg of R.paginas) {
        L.push('### ' + pg.caminho + (pg.titulo ? ' — "' + pg.titulo + '"' : ''), '');
        if (pg.estilos.length) L.push('- Estilos: ' + pg.estilos.map((e) => '`' + e.href + '`' + (e.externo ? ' (internet)' : e.faltando ? ' ❌ NÃO EXISTE' : '')).join(', '));
        if (pg.carrega.length) { L.push('- Códigos, nesta ordem:'); pg.carrega.forEach((s, i) => L.push('  ' + (i + 1) + '. `' + s.src + '`' + (s.modulo ? ' (módulo)' : '') + (s.externo ? ' — da internet' : s.faltando ? ' — ❌ NÃO EXISTE' : s.pacote ? ' — pacote' : ''))); }
        if (pg.inline.length) L.push('- Código escrito dentro da página: ' + pg.inline.length + ' bloco(s)' + (pg.inline.some((a) => a.biblioteca) ? ' (um é biblioteca embutida)' : ''));
        if (pg.cliques.length) L.push('- Botões com ação no HTML: ' + pg.cliques.length);
        L.push('');
      }
    }
    L.push('## 4. O que cada arquivo faz', '');
    for (const a of R.codigos) {
      if (a.biblioteca) { L.push('### ' + a.arquivo, '', '_Biblioteca pronta (código de outra pessoa, espremido). Não precisa mexer._', ''); continue; }
      L.push('### ' + a.arquivo, '');
      if (a.erro) L.push('🔴 **Não consegui ler: ' + a.erro + '** (esse código não roda).', '');
      if (a.aproximado) L.push('_TypeScript/JSX: funções achadas pelo jeito do texto._', '');
      if (a.imports.length) L.push('- Usa: ' + a.imports.map((i) => '`' + i.de + '`' + (i.resolvido ? '' : '')).join(', '));
      if (a.rotas.length) L.push('- Rotas do servidor: ' + a.rotas.map((r) => '`' + r.metodo + ' ' + r.caminho + '`').join(', '));
      if (a.fetches.length) L.push('- Chama o servidor: ' + [...new Set(a.fetches.map((f) => '`' + f.url + '`'))].join(', '));
      if (a.funcoes.length) {
        L.push('', '| Função | Linha | O que faz | Chama | É chamada por |', '|---|---|---|---|---|');
        for (const f of a.funcoes.slice(0, 120)) L.push('| `' + f.nome + '` | ' + f.ini + (f.linhas ? ' (' + f.linhas + ' l.)' : '') + ' | ' + f.faz + ' | ' + ((f.chamaAqui || []).slice(0, 6).join(', ') || '—') + ' | ' + ((f.chamadaPor || []).slice(0, 6).join(', ') || '—') + ' |');
        if (a.funcoes.length > 120) L.push('', '_…e mais ' + (a.funcoes.length - 120) + ' funções._');
      } else if (!a.erro) L.push('- (sem funções com nome)');
      L.push('');
    }
    const cliques = R.paginas.flatMap((p) => p.cliques.map((c) => Object.assign({ pg: p.caminho }, c)));
    if (cliques.length) { L.push('## 5. Botões e o que eles chamam', ''); for (const c of cliques.slice(0, 80)) L.push('- ' + c.pg + ': "' + c.texto + '" → `' + c.codigo + '`'); L.push(''); }
    if (pj || R.rotas.length || R.chamadasApi.length) {
      L.push('## 6. Peças de fora, comandos e servidor', '');
      if (pj) {
        if (pj.scripts) { L.push('**Comandos (npm run …):**', ''); for (const [k, v] of Object.entries(pj.scripts)) L.push('- `npm run ' + k + '` → `' + v + '`'); L.push(''); }
        const d = pj.dependencies || {}, dd = pj.devDependencies || {};
        if (Object.keys(d).length) L.push('**Pacotes (' + Object.keys(d).length + '):** ' + Object.entries(d).map(([k, v]) => k + ' ' + v).join(', '), '');
        if (Object.keys(dd).length) L.push('**Pacotes de montagem (' + Object.keys(dd).length + '):** ' + Object.keys(dd).join(', '), '');
      }
      if (R.rotas.length) { L.push('**Rotas do servidor (' + R.rotas.length + '):**', ''); for (const r of R.rotas.slice(0, 150)) L.push('- `' + r.metodo + ' ' + r.caminho + '` — ' + r.arquivo + ':' + r.linha); L.push(''); }
      if (R.chamadasApi.length) { L.push('**O que o app chama no servidor (' + new Set(R.chamadasApi.map((c) => c.url)).size + '):** ' + [...new Set(R.chamadasApi.map((c) => '`' + c.url + '`'))].slice(0, 80).join(', '), ''); }
    }
    L.push('## 7. Problemas', '');
    if (!R.problemas.length) L.push('Nenhum problema encontrado. ✅', '');
    for (const p of graves) L.push('- 🔴 ' + p.texto); for (const p of avisos) L.push('- 🟡 ' + p.texto);
    if (R.soltos && R.soltos.length) L.push('- ⚪ Arquivos que ninguém carrega (sobras?): ' + R.soltos.slice(0, 30).map((s) => '`' + s + '`').join(', '));
    L.push('');
    L.push('## 8. Quando algo quebrar, olhe aqui', '',
      '- **Tela branca / nada funciona:** veja em 7 os 🔴 (nome declarado 2 vezes, erro de escrita, arquivo que não existe). Um só desses trava tudo.',
      '- **Um botão não faz nada:** procure o botão em 5, veja qual função ele chama e ache a função em 4 (e quem ela chama).',
      '- **"404" / "não encontrado" / "Failed to fetch":** veja em 6 o que o app chama no servidor e se a rota existe.',
      '- **"Cannot find module":** pacote faltando no package.json (veja em 7).',
      '- **Funcionava e parou:** compare a versão boa com a ruim em ⚖️ Comparar A × B.', '');
    L.push('## 9. Pedido pronto para a IA', '', '```',
      'Este é o plano do meu projeto "' + R.nome + '" (' + tipo + '). Leia o plano inteiro antes.',
      graves.length ? 'Conserte primeiro os problemas graves (🔴) da seção 7, um de cada vez, me mostrando o arquivo INTEIRO consertado (não me peça para trocar pedaços).' : 'Não há problema grave. Me diga o que melhorar primeiro, um arquivo por vez.',
      'Mantenha o projeto modular (um arquivo por parte) e não mude o que já funciona.',
      'Se precisar ver um arquivo, me peça pelo nome exato que está no mapa (seção 2).', '```', '');
    return L.join('\n');
  };
  // mostrar .md como página (simples)
  LB.mdParaHTML = (md) => {
    const E = LB.esc; const out = []; const ls = md.split('\n'); let i = 0;
    const inl = (t) => E(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|\s)_([^_]+)_(?=\s|$|[.,])/g, '$1<i>$2</i>');
    while (i < ls.length) {
      const l = ls[i];
      if (l.startsWith('```')) { const b = []; i++; while (i < ls.length && !ls[i].startsWith('```')) b.push(ls[i++]); i++; out.push('<pre>' + E(b.join('\n')) + '</pre>'); continue; }
      if (/^\|/.test(l)) { const rows = []; while (i < ls.length && /^\|/.test(ls[i])) rows.push(ls[i++]); const cel = (r) => r.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim()); out.push('<table><tr>' + cel(rows[0]).map((c) => '<th>' + inl(c) + '</th>').join('') + '</tr>' + rows.slice(2).map((r) => '<tr>' + cel(r).map((c) => '<td>' + inl(c) + '</td>').join('') + '</tr>').join('') + '</table>'); continue; }
      if (/^\s*([-*]|\d+\.)\s/.test(l)) { const it = []; while (i < ls.length && /^\s*([-*]|\d+\.)\s/.test(ls[i])) it.push(ls[i++].replace(/^\s*([-*]|\d+\.)\s/, '')); out.push('<ul>' + it.map((x) => '<li>' + inl(x) + '</li>').join('') + '</ul>'); continue; }
      const h = /^(#{1,3})\s+(.*)$/.exec(l); if (h) { out.push('<h' + h[1].length + '>' + inl(h[2]) + '</h' + h[1].length + '>'); i++; continue; }
      if (l.startsWith('> ')) { out.push('<p class="muted">' + inl(l.slice(2)) + '</p>'); i++; continue; }
      if (l.trim()) out.push('<p>' + inl(l) + '</p>'); i++;
    }
    return out.join('\n');
  };
})(window.LB);

