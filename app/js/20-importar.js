/* Laboratório — 20-importar.js: traz um projeto (.zip, .tar.gz, pasta, um HTML só, vários arquivos, código colado). */
(function (LB) {
  'use strict';
  const BIN = /\.(png|jpe?g|gif|webp|bmp|ico|svgz|mp3|mp4|wav|ogg|webm|mov|zip|gz|tgz|rar|7z|apk|aab|exe|dll|so|wasm|woff2?|ttf|otf|eot|db|sqlite|class|jar|pdf|keystore|jks)$/i;
  const PULAR = /(^|\/)(node_modules|\.git|__MACOSX|\.cache)\//;
  const SEGREDO = /(^|\/)(\.env(\..*)?|.*\.pem|.*\.key|.*\.keystore|.*\.jks|credentials\.json|chave-ia\.txt)$/i;
  function decodificar(u8) { try { return new TextDecoder('utf-8', { fatal: true }).decode(u8); } catch { return new TextDecoder('windows-1252').decode(u8); } }
  function registro(caminho, u8) { return BIN.test(caminho) ? { b: u8.length } : { t: decodificar(u8).replace(/^﻿/, '') }; }
  // tira a pasta de cima quando tudo está dentro de uma só
  function semTopo(lista) {
    if (!lista.length) return lista;
    const primeira = lista[0].caminho.split('/')[0];
    if (lista.every((x) => x.caminho.includes('/') && x.caminho.split('/')[0] === primeira)) return lista.map((x) => Object.assign(x, { caminho: x.caminho.slice(primeira.length + 1) }));
    return lista;
  }
  async function lerTar(u8) {
    if (u8[0] === 0x1f && u8[1] === 0x8b) { const s = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip')); u8 = new Uint8Array(await new Response(s).arrayBuffer()); }
    const out = [], dec = new TextDecoder(); const str = (a, b) => { const s = u8.subarray(a, b); const z = s.indexOf(0); return dec.decode(z >= 0 ? s.subarray(0, z) : s); };
    let p = 0, longo = null, pax = null;
    while (p + 512 <= u8.length) {
      if (u8[p] === 0 && u8[p + 1] === 0) break;
      let nome = str(p, p + 100); const tam = parseInt(str(p + 124, p + 136).trim() || '0', 8) || 0; const tipo = String.fromCharCode(u8[p + 156] || 48);
      const pre = str(p + 345, p + 500); if (pre && str(p + 257, p + 262) === 'ustar') nome = pre + '/' + nome;
      const ini = p + 512, fim = ini + tam;
      if (tipo === 'L') longo = str(ini, fim); else if (tipo === 'x') { const m = /\d+ path=([^\n]*)\n/.exec(dec.decode(u8.subarray(ini, fim))); pax = m ? m[1] : null; }
      else if (tipo === '0' || tipo === '\0' || tipo === '7') { out.push({ caminho: pax || longo || nome, u8: u8.slice(ini, fim) }); longo = pax = null; } else { longo = pax = null; }
      p = ini + Math.ceil(tam / 512) * 512;
    }
    return out;
  }
  async function deCompactado(arq) {
    const u8 = new Uint8Array(await arq.arrayBuffer());
    if (u8[0] === 0x50 && u8[1] === 0x4b) { const z = await JSZip.loadAsync(u8); const out = []; for (const k of Object.keys(z.files)) if (!z.files[k].dir) out.push({ caminho: k, u8: await z.file(k).async('uint8array') }); return out; }
    return lerTar(u8);
  }
  async function guardar(nomeSugerido, lista, origem) {
    lista = semTopo(lista.filter((x) => !PULAR.test(x.caminho + '/') && !PULAR.test(x.caminho)));
    const segredos = lista.filter((x) => SEGREDO.test(x.caminho)).map((x) => x.caminho);
    lista = lista.filter((x) => !SEGREDO.test(x.caminho));
    if (!lista.length) throw new Error('Não achei arquivos nesse pacote.');
    const nome = (await LB.pedir('Nome deste projeto (para não misturar com os outros):', nomeSugerido)) || nomeSugerido;
    const arquivos = {}; for (const x of lista) arquivos[x.caminho] = registro(x.caminho, x.u8);
    const p = { id: LB.novoId(), nome: nome.trim() || nomeSugerido, criado: Date.now(), origem, arquivos };
    await LB.banco.salvar(p); await LB.carregarProjetos();
    LB.escolher(p.id);
    LB.aviso('✅ "' + p.nome + '": ' + lista.length + ' arquivo(s)' + (segredos.length ? ' · deixei de fora ' + segredos.length + ' arquivo(s) com senha/chave' : ''), 'ok');
    return p;
  }
  const nomeSem = (n) => n.replace(/\.(tar\.gz|tgz|taz|tar|gz|zip)$/i, '');
  LB.importarCompactado = async (arq) => guardar(nomeSem(arq.name), await deCompactado(arq), arq.name);
  LB.importarArquivos = async (arqs, comPasta) => {
    const lista = [];
    for (const f of arqs) lista.push({ caminho: comPasta && f.webkitRelativePath ? f.webkitRelativePath : f.name, u8: new Uint8Array(await f.arrayBuffer()) });
    const primeiro = arqs[0]; const sug = comPasta && primeiro.webkitRelativePath ? primeiro.webkitRelativePath.split('/')[0] : (arqs.length === 1 ? primeiro.name.replace(/\.[^.]+$/, '') : 'arquivos ' + new Date().toLocaleDateString('pt-BR'));
    return guardar(sug, lista, comPasta ? 'pasta' : 'arquivos');
  };
  LB.importarColado = async () => {
    const t = await LB.pedir('Cole o código (um HTML inteiro, ou um JS):', '', true); if (!t || !t.trim()) return;
    const ehHTML = /<(!doctype|html|head|body|script|div)/i.test(t);
    return guardar('codigo-colado', [{ caminho: ehHTML ? 'index.html' : 'codigo.js', u8: new TextEncoder().encode(t) }], 'colado');
  };
  LB.lerTar = lerTar;
})(window.LB);

