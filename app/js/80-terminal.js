/* Laboratório — 80-terminal.js: 💻 TERMINAL DE VERDADE — com a MESMA lógica do Mini SK (a que não cai):
   📱 TERMUX (celular): conecta no ttyd (ws://127.0.0.1:7681/ws), religa sozinho se cair, e liga a ponte
      de arquivos em PEDACINHOS (antes ia numa linha gigante e o Termux derrubava a conexão);
      se a ponte cair, religa sozinha. Instala o Node sozinho na 1ª vez.
   💻 COMPUTADOR: quando o Laboratório é aberto PELO Mini SK do PC (botão "🌐 Abrir como app"),
      usa o terminal e a ponte do próprio programa — os projetos vão para C:\Mini-SK\NOME.
   ▶ Ligar tudo = conecta → liga a ponte → manda o projeto → entra na pasta.
   🚀 Rodar o projeto (instala as peças se faltar e liga com o comando certo), 🔁 servidor sem cair,
   🦙 Ollama, ⬇ Trazer o que o terminal criou, 👁 ver a porta. */
window.LabTermux = (function () {
  'use strict';
  const XTERM = 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0';
  const FIT = 'https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/lib/addon-fit.js';
  // 💻 aberto pelo Mini SK do PC? (a janela dele traz o "miniskPC")
  const PC = (() => { try { return window.miniskPC || (window.parent !== window && window.parent.miniskPC) || (window.opener && window.opener.miniskPC) || null; } catch (e) { return null; } })();
  const WIN = !!(PC && PC.so === 'win32');
  const PADRAO = PC && PC.portas && PC.portas.terminal ? 'ws://127.0.0.1:' + PC.portas.terminal + '/ws' : 'ws://127.0.0.1:7681/ws';
  const PORTA_PONTE = PC && PC.portas && PC.portas.ponte ? PC.portas.ponte : 7683;
  const PONTE = 'http://127.0.0.1:' + PORTA_PONTE;
  const CMD_INSTALAR = 'pkg install -y ttyd';
  const CMD_LIGAR = 'ttyd -W -i 127.0.0.1 -p 7681 bash';
  const enc = new TextEncoder(), dec = new TextDecoder();
  let box = null, ws = null, term = null, fit = null, simples = false, abriu = false, saindo = false, montado = false, tentativas = 0;

  const pref = {
    get(k, d) { try { const v = localStorage.getItem('lab:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('lab:' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const $ = (s) => (box ? box.querySelector(s) : null);
  const E = (s) => LB.esc(s);
  const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
  function status(t, tipo) { const el = $('#tx-status'); if (!el) return; el.textContent = t; el.className = 'tx-status ' + (tipo || ''); }
  function pst(t, k) { const s = $('#tx-p-status'); if (!s) return; s.textContent = t; s.style.color = k === 'erro' ? 'var(--er)' : k === 'ok' ? 'var(--ok)' : ''; }
  function carregarScript(src, pronto) { return new Promise((ok, erro) => { if (pronto()) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => erro(new Error('sem internet')); document.head.appendChild(s); }); }
  function carregarCss(href) { if (document.querySelector('link[href="' + href + '"]')) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }

  // ── tela: xterm (bonito) ou modo simples (sem internet para baixar o xterm) ──
  async function prepararTela() {
    if (term || simples) return;
    try {
      carregarCss(XTERM + '/css/xterm.css');
      if (!window.XTermTerminal) {
        const antes = window.Terminal;
        await carregarScript(XTERM + '/lib/xterm.js', () => false);
        window.XTermTerminal = window.Terminal; window.Terminal = antes;
      }
      await carregarScript(FIT, () => !!window.FitAddon);
      term = new window.XTermTerminal({ fontSize: pref.get('termFonte', 14), cursorBlink: true, convertEol: true, theme: { background: '#07110d', foreground: '#d7f5e3' } });
      fit = new window.FitAddon.FitAddon(); term.loadAddon(fit);
      term.open($('#tx-term'));
      try { fit.fit(); } catch (e) {}
      term.onData((d) => enviar(d));
      try { let lw = 0, lh = 0, t = 0; new ResizeObserver((ents) => { const r = ents[0].contentRect; if (Math.abs(r.width - lw) < 4 && Math.abs(r.height - lh) < 4) return; lw = r.width; lh = r.height; clearTimeout(t); t = setTimeout(() => { try { fit.fit(); tamanho(); } catch (e) {} }, 200); }).observe($('#tx-term')); } catch (e) {}
    } catch (e) {
      simples = true;
      $('#tx-term').innerHTML = '<pre id="tx-pre" class="tx-pre"></pre><div class="lab-linha"><input id="tx-in" class="lab-busca" style="flex:1" placeholder="Digite o comando e toque em ⏎" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="btn btn-primary" id="tx-ok">⏎</button></div>';
      const ir = () => { const i = $('#tx-in'); enviar(i.value + '\r'); i.value = ''; };
      $('#tx-ok').onclick = ir;
      $('#tx-in').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); ir(); } });
    }
  }
  let saida = '';
  function escreverTela(bytes) {
    const txt = dec.decode(bytes);
    saida = (saida + txt.replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]|\x1b\][^\x07]*\x07/g, '')).slice(-8000); // últimas linhas (para a 🤖 IA)
    if (term) { term.write(bytes); return; }
    const pre = $('#tx-pre'); if (!pre) return;
    pre.textContent += txt.replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]|\x1b\][^\x07]*\x07|\x1b[()][A-Z0-9]|\r(?!\n)/g, '');
    if (pre.textContent.length > 60000) pre.textContent = pre.textContent.slice(-40000);
    pre.scrollTop = pre.scrollHeight;
  }

  // ── o "idioma" do ttyd (o terminal do Mini SK do PC fala o mesmo) ──
  function enviar(texto) { if (ws && ws.readyState === 1) ws.send(enc.encode('0' + texto)); }
  function tamanho() { if (ws && ws.readyState === 1 && term) ws.send(enc.encode('1' + JSON.stringify({ columns: term.cols, rows: term.rows }))); }
  const ligado = () => !!(ws && ws.readyState === 1);

  function conectar() {
    return new Promise(async (pronto) => {
      const url = PC ? PADRAO : (($('#tx-url') && $('#tx-url').value) || PADRAO).trim();
      if (!PC) pref.set('termuxUrl', url);
      if (!/^wss?:\/\//.test(url)) { status('O endereço precisa começar com ws://', 'erro'); return pronto(false); }
      await prepararTela();
      desconectar(true);
      abriu = false; saindo = false;
      status(PC ? 'Ligando o terminal do computador…' : 'Chamando o Termux…');
      try { ws = new WebSocket(url, ['tty']); } catch (e) { status('Endereço inválido: ' + e.message, 'erro'); return pronto(false); }
      ws.binaryType = 'arraybuffer';
      const meu = ws;
      ws.onopen = () => {
        abriu = true; tentativas = 0;
        ws.send(enc.encode(JSON.stringify({ AuthToken: '', columns: term ? term.cols : 80, rows: term ? term.rows : 24 })));
        status(PC ? '✅ Terminal do computador ligado.' : '✅ Ligado no Termux. Pode digitar.', 'ok');
        if ($('#tx-con')) { $('#tx-con').hidden = true; $('#tx-des').hidden = false; }
        if (term) term.focus();
        pronto(true);
      };
      ws.onmessage = (ev) => {
        const d = typeof ev.data === 'string' ? enc.encode(ev.data) : new Uint8Array(ev.data);
        if (d.length && String.fromCharCode(d[0]) === '0') escreverTela(d.subarray(1));
      };
      ws.onclose = (ev) => {
        if (ws !== meu) return;
        if ($('#tx-con')) { $('#tx-con').hidden = false; $('#tx-des').hidden = true; }
        ws = null;
        if (!abriu) { status(PC ? '❌ O terminal do programa não respondeu. Feche e abra o Mini SK.' : '❌ O Termux não respondeu. O Termux está aberto? Rodou o comando 2 (com -W)? Se o navegador perguntar sobre "dispositivos da rede local", toque em Permitir.', 'erro'); return pronto(false); }
        // caiu no meio: religa sozinho (igual ao Mini SK)
        if (!saindo && ev.code !== 1000 && tentativas < 4) { tentativas++; status('A conexão caiu. Religando sozinho (' + tentativas + '/4)…', 'erro'); setTimeout(() => { if (!ws) conectar(); }, 2000); return; }
        status(saindo || ev.code === 1000 ? 'Desligado.' : 'A conexão caiu (o Android pode ter fechado o Termux). Abra o Termux e toque em ▶ Ligar tudo de novo.', saindo || ev.code === 1000 ? '' : 'erro');
      };
      ws.onerror = () => {};
    });
  }
  function desconectar(quieto) { saindo = true; if (ws) { const w = ws; ws = null; try { w.close(1000); } catch (e) {} } if (!quieto) status('Desligado.'); }
  async function copiar(t) { try { await navigator.clipboard.writeText(t); LB.aviso('📋 Copiado. Cole no Termux.', 'ok'); } catch (e) { LB.pedir('Copie este comando:', t, true); } }

  // ── ponte de arquivos (Node no Termux; no PC é a do próprio programa) ──
  const PONTE_JS = "// Ponte de arquivos do Laboratório — roda no Termux. Mesmo jeito da ponte do Mini SK.\nconst http=require('http'),fs=require('fs'),path=require('path'),os=require('os');\nconst CODIGO=process.argv[2]||'',PORTA=Number(process.argv[3]||7683);\nconst BASE=path.join(os.homedir(),'laboratorio');\nconst PULAR=/(^|\\/)(node_modules|\\.git|\\.cache)(\\/|$)/;\nfs.mkdirSync(BASE,{recursive:true});\nconst nome=(n)=>String(n||'projeto').replace(/[^\\w.\\- ]+/g,'_').replace(/^\\.+/,'').slice(0,60)||'projeto';\nfunction dentro(proj,rel){const raiz=path.resolve(BASE,nome(proj));const p=path.resolve(raiz,String(rel||''));if(p!==raiz&&!p.startsWith(raiz+path.sep))throw new Error('caminho inválido: '+rel);return{raiz,p};}\nfunction responder(res,c,o){res.writeHead(c,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(o));}\nfunction corpo(req){return new Promise((ok,erro)=>{const ps=[];let n=0;req.on('data',(c)=>{n+=c.length;if(n>80e6){erro(new Error('grande demais'));req.destroy();}else ps.push(c);});req.on('end',()=>{try{ok(JSON.parse(Buffer.concat(ps).toString('utf8')||'{}'));}catch(e){erro(e);}});req.on('error',erro);});}\nprocess.on('uncaughtException',(e)=>console.error('erro:',e&&e.message));\nhttp.createServer(async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Codigo');res.setHeader('Access-Control-Allow-Private-Network','true');\nif(req.method==='OPTIONS'){res.writeHead(204);return res.end();}\nif(!CODIGO||req.headers['x-codigo']!==CODIGO)return responder(res,403,{erro:'código errado'});\nconst u=new URL(req.url,'http://x');\ntry{\nif(u.pathname==='/ping')return responder(res,200,{ok:true,pasta:BASE,versao:2,agora:Date.now()});\nif(u.pathname==='/enviar'&&req.method==='POST'){const b=await corpo(req);let n=0;const pulados=[];for(const a of b.arquivos||[]){try{if(PULAR.test(a.p))continue;const{p}=dentro(b.projeto,a.p);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,a.b64!=null?Buffer.from(a.b64,'base64'):String(a.t||''));n++;}catch(e){pulados.push(a.p+': '+e.message);}}return responder(res,200,{ok:true,n,pulados,pasta:dentro(b.projeto,'').raiz,agora:Date.now()+1});}\nif(u.pathname==='/listar'){const{raiz}=dentro(u.searchParams.get('projeto'),'');const desde=Number(u.searchParams.get('desde')||0);const lista=[];let total=0,cortou=false;const andar=(d)=>{let it=[];try{it=fs.readdirSync(d,{withFileTypes:true});}catch(e){return;}for(const e of it){const f=path.join(d,e.name),rel=path.relative(raiz,f).split(path.sep).join('/');if(PULAR.test(rel))continue;if(e.isDirectory()){andar(f);continue;}if(!e.isFile())continue;const st=fs.statSync(f);if(st.mtimeMs<=desde||st.size>5e6)continue;if(total+st.size>30e6){cortou=true;continue;}total+=st.size;lista.push({p:rel,b64:fs.readFileSync(f).toString('base64')});}};const agora=Date.now();andar(raiz);return responder(res,200,{ok:true,agora,arquivos:lista,cortou});}\nresponder(res,404,{erro:'não existe'});\n}catch(e){responder(res,500,{erro:e.message});}\n}).listen(PORTA,'127.0.0.1',()=>console.log('Ponte do Laboratório ligada na porta '+PORTA+' · pasta '+BASE));\n";
  function codigo() { if (PC) return PC.codigo; let c = pref.get('ponteCodigo', ''); if (!c) { const a = new Uint8Array(12); crypto.getRandomValues(a); c = Array.from(a, (x) => x.toString(16).padStart(2, '0')).join(''); pref.set('ponteCodigo', c); } return c; }
  async function chamar1(caminho, corpo) {
    let r;
    try { r = await fetch(PONTE + caminho, { method: corpo ? 'POST' : 'GET', headers: Object.assign({ 'X-Codigo': codigo() }, corpo ? { 'Content-Type': 'application/json' } : {}), body: corpo ? JSON.stringify(corpo) : undefined }); }
    catch (e) { throw new Error('A ponte não respondeu.'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erro === 'código errado' ? 'A ponte foi ligada por outro aparelho/navegador. Toque em 🧩 Ligar a ponte de novo.' : (j.erro || 'erro ' + r.status));
    return j;
  }
  // se a ponte caiu (o Android fecha o "node" quando o Termux fica para trás), religa sozinha e tenta de novo
  let religando = null, falhouReligar = 0;
  async function chamar(caminho, corpo, semReligar) {
    try { return await chamar1(caminho, corpo); }
    catch (e) {
      const caiu = /não respondeu|outro aparelho/.test(e.message);
      if (!caiu || semReligar || PC || !ligado()) throw e;
      if (Date.now() - falhouReligar < 60000) throw e;
      if (!religando) religando = ligarPonte((t) => pst('🔁 A ponte tinha caído — religando… ' + t)).catch((er) => { falhouReligar = Date.now(); throw er; }).finally(() => { religando = null; });
      await religando;
      pst('✅ Ponte religada sozinha.', 'ok');
      return chamar1(caminho, corpo);
    }
  }
  let ultimoErroPonte = '';
  async function ping(versao) {
    try { const j = await chamar('/ping', null, true); ultimoErroPonte = (j.versao || 1) < (versao || 0) ? 'ponte antiga ligada' : ''; return !versao || (j.versao || 1) >= versao; }
    catch (e) { ultimoErroPonte = /não respondeu/.test(e.message) ? 'a porta ' + PORTA_PONTE + ' não responde' : e.message; return false; }
  }
  async function ligarPonte(passo) {
    passo = passo || (() => {});
    if (PC) { if (await ping()) return true; throw new Error('A ponte do programa não respondeu. Feche o Mini SK e abra de novo.'); }
    if (!ligado()) throw new Error('Conecte o Termux primeiro (▶ Ligar tudo).');
    const b64 = btoa(unescape(encodeURIComponent(PONTE_JS)));
    // em pedacinhos de 900 letras (uma linha gigante fazia o Termux derrubar a conexão)
    enviar(' rm -f ~/.ponte-lab.b64\r'); await espera(250);
    for (let i = 0; i < b64.length; i += 900) {
      if (!ligado()) throw new Error('A conexão com o Termux caiu no meio. Toque em ▶ Ligar tudo de novo.');
      enviar(" printf %s '" + b64.slice(i, i + 900) + "' >> ~/.ponte-lab.b64\r"); await espera(250);
      passo('mandando a ponte… ' + Math.min(100, Math.round((i + 900) / b64.length * 100)) + '%');
    }
    enviar(" clear; if ! command -v node >/dev/null; then echo '⏳ Instalando o Node no Termux (só da 1ª vez — uns minutos)…'; pkg update -y && pkg install -y nodejs-lts; fi; termux-wake-lock 2>/dev/null; base64 -d ~/.ponte-lab.b64 > ~/ponte-laboratorio.js && { pkill -f 'node .*[p]onte-laboratorio'; nohup node ~/ponte-laboratorio.js " + codigo() + " " + PORTA_PONTE + " > ~/ponte-laboratorio.log 2>&1 & } ; sleep 2; if command -v node >/dev/null; then echo '✅ Ponte do Laboratório ligada'; else echo '❌ O Node não instalou. Rode: pkg update  e depois  pkg install nodejs-lts'; fi\r");
    const ini = Date.now(), fim = ini + 300000;
    while (Date.now() < fim) {
      if (await ping(2)) return true;
      if (!ligado()) break;
      passo('Esperando a ponte responder… ' + Math.round((Date.now() - ini) / 1000) + ' s (na 1ª vez o Termux instala o Node: pode levar uns minutos — olhe o terminal)');
      await espera(2500);
    }
    if (ligado()) enviar(" echo; echo '--- 🩺 por que a ponte não ligou ---'; node -v || echo 'NODE NÃO ESTÁ INSTALADO'; tail -n 15 ~/ponte-laboratorio.log 2>/dev/null\r");
    throw new Error('A ponte não respondeu' + (ultimoErroPonte ? ' (' + ultimoErroPonte + ')' : '') + '. Olhe o terminal: escrevi lá o motivo. Tire um print e me mande.');
  }

  // ── o projeto escolhido lá em cima ↔ a pasta no Termux / no PC ──
  const projAtual = () => LB.projeto(LB.atual);
  const nomeProj = () => String((projAtual() || {}).nome || 'projeto').replace(/[^\w.\- ]+/g, '_').replace(/^\.+/, '').slice(0, 60) || 'projeto';
  const PULAR = /(^|\/)(node_modules|\.git)(\/|$)/;
  let pastaAtual = '';
  async function mandarProjeto() {
    const proj = projAtual();
    if (!proj || !Object.keys(proj.arquivos || {}).length) throw new Error('Escolha (ou importe) um projeto lá em cima primeiro.');
    if (!(await ping(PC ? 0 : 2))) await ligarPonte((t) => pst(t));
    const projeto = nomeProj();
    let lote = [], tam = 0, n = 0, pulados = [], pasta = '', agora = 0;
    const enviarLote = async () => { if (!lote.length) return; const r = await chamar('/enviar', { projeto, arquivos: lote }); n += r.n; pulados = pulados.concat(r.pulados || []); pasta = r.pasta; agora = r.agora; lote = []; tam = 0; };
    for (const [p, reg] of Object.entries(proj.arquivos)) {
      if (PULAR.test(p)) continue;
      if (!reg || reg.t == null) continue; // binários (imagens…) não ficam guardados no Laboratório
      lote.push({ p, t: reg.t }); tam += reg.t.length;
      if (tam > 3e6) await enviarLote();
    }
    await enviarLote();
    pref.set('sync:' + projeto, agora || Date.now());
    pastaAtual = pasta;
    if (ligado() && pasta) enviar('cd ' + (WIN ? '"' + pasta + '"' : JSON.stringify(pasta)) + '\r');
    return { n, pulados, pasta };
  }
  async function trazer() {
    const proj = projAtual(); if (!proj) throw new Error('Escolha o projeto lá em cima primeiro.');
    const projeto = nomeProj();
    const r = await chamar('/listar?projeto=' + encodeURIComponent(projeto) + '&desde=' + pref.get('sync:' + projeto, 0));
    const fs = proj.arquivos;
    let novos = 0, mudou = 0;
    for (const a of r.arquivos) {
      if (PULAR.test(a.p)) continue;
      const bin = atob(a.b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i += 1) u[i] = bin.charCodeAt(i);
      const ehTexto = /\.(html?|css|m?js|cjs|jsx|tsx?|json|md|txt|ya?ml|svg|xml|py|sh|toml|map|env\.example)$/i.test(a.p);
      const existia = a.p in fs;
      if (ehTexto) { const t = dec.decode(u); if (existia && fs[a.p] && fs[a.p].t === t) continue; fs[a.p] = { t }; }
      else fs[a.p] = { b: u.length };
      existia ? mudou++ : novos++;
    }
    await LB.banco.salvar(proj);
    window.dispatchEvent(new CustomEvent('lab-projeto-mudou', { detail: proj.id }));
    pref.set('sync:' + projeto, r.agora);
    return { novos, mudou, cortou: r.cortou };
  }

  /** ▶ Ligar tudo: conecta → ponte → manda o projeto → entra na pasta */
  async function ligarTudo() {
    pst('');
    if (!ligado()) { const ok = await conectar(); if (!ok) return; await espera(400); }
    if (!projAtual()) { status('✅ Terminal ligado. Escolha um projeto lá em cima para mandar para ' + (PC ? 'o computador' : 'o Termux') + '.', 'ok'); return; }
    pst(PC ? 'Mandando o projeto para a pasta do computador…' : 'Ligando a ponte e mandando o projeto…');
    const r = await mandarProjeto();
    pst('✅ ' + r.n + ' arquivo(s) em ' + r.pasta + (r.pulados.length ? ' · pulados: ' + r.pulados.length : '') + '. Já entrei na pasta. Agora: 🚀 Rodar o projeto.', 'ok');
  }

  /** lê o package.json do projeto escolhido e decide qual comando liga, em qual porta e qual peça precisa */
  function planoLigar() {
    const p = projAtual(); if (!p) return null;
    const chave = Object.keys(p.arquivos).filter((c) => /(^|\/)package\.json$/.test(c) && !/node_modules/.test(c)).sort((a, b) => a.length - b.length)[0];
    let j; try { j = JSON.parse(p.arquivos[chave].t); } catch (e) { return null; }
    const sub = chave.includes('/') ? chave.slice(0, chave.lastIndexOf('/')) : '';
    const sc = (j && j.scripts) || {};
    let script = null;
    if (/^\s*vite\b/.test(sc.dev || '') && sc.servidor) script = 'servidor';
    else if (sc.dev) script = 'dev'; else if (sc.start) script = 'start'; else if (sc.servidor) script = 'servidor';
    if (!script) return null;
    const txt = sc[script] || '';
    const m = /--port[ =](\d{2,5})|PORT=(\d{2,5})|-p (\d{2,5})/.exec(txt);
    let porta = 5173;
    if (m) porta = Number(m[1] || m[2] || m[3]); else if (/next/.test(txt)) porta = 3000; else if (script === 'servidor' || /server|tsx|node /.test(txt)) porta = 5000;
    let bin = (txt.trim().split(/\s+/)[0] || '').replace(/[^\w.-]/g, '');
    if (!bin || /^(node|npm|npx|cross-env)$/.test(bin)) { const d = Object.assign({}, j.dependencies, j.devDependencies); bin = d.vite ? 'vite' : d.tsx ? 'tsx' : d.next ? 'next' : d.nodemon ? 'nodemon' : 'vite'; }
    return { script, porta, bin, sub };
  }
  function rodarProjeto() {
    const pl = planoLigar();
    if (!pl) { pst('⚠ Este projeto não tem package.json com "dev" ou "start". Se for só HTML, veja pelo 🗺️ Plano ou abra no Mini SK.', 'erro'); return; }
    if (!ligado()) { pst('Toque em ▶ Ligar tudo primeiro.', 'erro'); return; }
    const inst = 'npm install --legacy-peer-deps --loglevel http';
    const sub = pl.sub ? (WIN ? 'cd "' + pl.sub.replace(/\//g, '\\') + '"' : 'cd ' + JSON.stringify(pl.sub)) : '';
    if (sub) { enviar(sub + '\r'); }
    if (WIN) enviar('if not exist node_modules\\.bin\\' + pl.bin + '.cmd (' + inst + ' && npm run ' + pl.script + ') else (npm run ' + pl.script + ')\r');
    else if (PC) enviar('[ -e node_modules/.bin/' + pl.bin + ' ] || ' + inst + '; npm run ' + pl.script + '\r');
    else enviar('termux-wake-lock 2>/dev/null; [ -e node_modules/.bin/' + pl.bin + ' ] || ' + inst + '; npm run ' + pl.script + '\r');
    $('#tx-porta').value = pl.porta; pref.set('portaVer', pl.porta);
    pst('▶ Rodando npm run ' + pl.script + ' (na 1ª vez instala as peças: alguns minutos). Quando o terminal mostrar a porta (' + pl.porta + '), toque em 👁 Visualizar.', 'ok');
  }
  const CMD_SEM_CAIR = () => 'termux-wake-lock 2>/dev/null; cd ~/laboratorio/\'' + nomeProj() + '\' 2>/dev/null; if [ ! -f package.json ]; then echo "❌ Não achei o package.json em $(pwd). Toque em ▶ Ligar tudo (manda o projeto) e tente de novo."; else pkill -f "[t]sx server" 2>/dev/null; pkill -f "[b]in/vite" 2>/dev/null; sleep 1; if [ -d dist ] && grep -q \'"start"\' package.json; then S=start; elif grep -q \'"dev": *"vite\' package.json && grep -q \'"servidor"\' package.json; then S=servidor; elif grep -q \'"dev"\' package.json; then S=dev; elif grep -q \'"start"\' package.json; then S=start; else S=; fi; if [ -z "$S" ]; then echo "❌ Este projeto não tem dev nem start no package.json."; else echo "▶ Ligando: npm run $S (religa sozinho se o Android fechar)"; f=0; while true; do t=$(date +%s); npm run $S; d=$(( $(date +%s) - t )); if [ $d -lt 20 ]; then f=$((f+1)); else f=0; fi; if [ $f -ge 3 ]; then echo "❌ Caiu 3 vezes logo ao ligar: é ERRO do projeto (ou porta ocupada). Parei. Leia o erro vermelho acima."; break; fi; echo "⚠ O servidor parou. Religando em 3 s… (Ctrl+C para parar)"; sleep 3; done; fi; fi';
  const CMD_OLLAMA = 'termux-wake-lock 2>/dev/null; pkill -f "ollama serve"; OLLAMA_ORIGINS="*" OLLAMA_NUM_PARALLEL=1 OLLAMA_MAX_LOADED_MODELS=1 OLLAMA_CONTEXT_LENGTH=4096 OLLAMA_KEEP_ALIVE=10m nohup ollama serve > ~/ollama.log 2>&1 & sleep 2; echo "✅ Ollama ligado. Na 🤖 IA ele aparece sozinho (modelo leve no celular: llama3.2:1b, qwen2.5:1.5b)."';
  async function ligarOllama() {
    if (PC) { const r = PC.ligarOllama ? await PC.ligarOllama() : 'este Mini SK é antigo'; pst('🦙 Ollama: ' + r + (/não achei/.test(r) ? ' — instale em ollama.com/download' : '. Na 🤖 IA ele aparece sozinho.'), /não/.test(r) ? 'erro' : 'ok'); return; }
    if (!ligado()) { pst('Toque em ▶ Ligar tudo primeiro.', 'erro'); return; }
    enviar(' command -v ollama >/dev/null || pkg install -y ollama; ' + CMD_OLLAMA + '\r');
    pst('🦙 Ligando o Ollama no Termux… (na 1ª vez instala: alguns minutos)', 'ok');
  }

  function tela() {
    const el = document.getElementById('panel-terminal'); if (!el) return;
    if (montado) return;
    montado = true; box = el;
    el.innerHTML =
      '<div class="lab-topo"><h2>💻 Terminal de verdade ' + (PC ? '(do computador)' : '(Termux)') + '</h2>' +
      (PC ? '<p class="lab-mut">Aberto pelo <b>Mini SK do computador</b>: usa o terminal e a ponte do programa. O projeto escolhido lá em cima vai para <code>' + E(PC.pasta || 'C:\\Mini-SK') + '\\NOME</code>.</p>'
          : '<p class="lab-mut">Liga o Laboratório ao <b>Termux</b> do celular — um Linux de verdade, do mesmo jeito do Mini SK. O projeto escolhido lá em cima vai para <code>~/laboratorio/NOME</code>.</p>') + '</div>' +
      (PC ? '' : '<details class="lab-det"' + (pref.get('termuxJaLigou', false) ? '' : ' open') + '><summary><b>Como ligar o Termux</b> (toque para ver)</summary><ol class="lab-ul">' +
        '<li>No Termux, <b>só da primeira vez</b>:<div class="lab-linha"><code>' + CMD_INSTALAR + '</code><button class="lab-mini" data-copiar="1">Copiar</button></div></li>' +
        '<li>No Termux, <b>toda vez</b> (e deixe o Termux aberto):<div class="lab-linha"><code>' + CMD_LIGAR + '</code><button class="lab-mini" data-copiar="2">Copiar</button></div><small class="lab-mut">O <b>-W</b> deixa digitar. O <b>-i 127.0.0.1</b> faz só o seu celular enxergar.</small></li>' +
        '<li>Volte aqui e toque em <b>▶ Ligar tudo</b>.</li></ol>' +
        '<div class="lab-linha"><input id="tx-url" class="lab-busca" style="flex:1;min-width:200px" aria-label="Endereço do Termux" spellcheck="false" autocapitalize="off"></div></details>') +
      '<div class="lab-linha"><button class="btn btn-primary" id="tx-tudo">▶ Ligar tudo</button><button class="btn" id="tx-rodar">🚀 Rodar o projeto</button><button class="btn" id="tx-parar">⏹ Parar</button><button class="btn" id="tx-ollama">🦙 Ligar o Ollama</button><button class="lab-chip" id="tx-des" hidden>Desligar</button><button class="lab-chip" id="tx-con" hidden>🔌 Religar</button></div>' +
      '<div id="tx-status" class="tx-status">Desligado.</div>' +
      '<div id="tx-p-status" class="lab-mut"></div>' +
      '<div id="tx-term" class="tx-term"></div>' +
      '<div class="lab-linha"><button class="lab-chip" data-t="\x03">Ctrl+C</button><button class="lab-chip" data-t="\t">Tab</button><button class="lab-chip" data-t="\x1b[A">↑</button><button class="lab-chip" data-t="\x1b[B">↓</button>' + (PC ? '' : '<button class="lab-chip" data-t="\x04">Ctrl+D</button>') + '<button class="lab-chip" id="tx-limpar">🧽 Limpar</button><button class="lab-chip" id="tx-menos">A−</button><button class="lab-chip" id="tx-mais">A+</button><button class="lab-chip" id="tx-ia">🤖 Perguntar à IA</button></div>' +
      '<div class="lab-det"><b>⚡ Comandos prontos</b><div class="lab-linha">' +
        '<button class="lab-chip" data-cmd="npm install --legacy-peer-deps --loglevel http">📦 npm install</button><button class="lab-chip" data-cmd="npm run build">🏗 npm run build</button>' +
        (PC ? '<button class="lab-chip" data-cmd="dir">📂 dir</button>' : '<button class="lab-chip" id="tx-sem-cair">🔁 Ligar o servidor sem cair</button><button class="lab-chip" data-cmd="ls -la">📂 ls</button><button class="lab-chip" data-cmd="termux-wake-lock">🔋 não deixar o Android fechar</button>') +
        '<button class="lab-chip" data-cmd="node -v && npm -v">🔢 versões</button></div>' +
        '<div class="lab-linha"><button class="btn" id="tx-p-mandar">⬆ Mandar o projeto de novo</button><button class="btn btn-primary" id="tx-p-trazer">⬇ Trazer o que o terminal criou</button>' + (PC ? '' : '<button class="lab-chip" id="tx-p-ligar">🧩 Religar só a ponte</button>') + '</div>' +
        '<p class="lab-mut">⬇ Trazer: depois do <code>npm run build</code>, traz para o projeto o que foi criado (a pasta <code>dist</code>) — aí o 🗺️ Plano e o ⚖️ Comparar enxergam.</p></div>' +
      '<div class="lab-det"><b>👁 Visualizar o que o terminal ligou</b>' +
      '<div class="lab-linha"><input id="tx-porta" class="lab-busca" style="width:110px" inputmode="numeric" aria-label="Porta"><button class="btn btn-primary" id="tx-ver">👁 Visualizar</button><button class="lab-chip" id="tx-ver-fora">↗ Abrir fora</button></div>' +
      '<div class="lab-linha">' + [5173, 5000, 3000, 8080, 4173].map((p) => '<button class="lab-chip" data-porta="' + p + '">' + p + '</button>').join('') + '</div>' +
      '<div class="lab-moldura largo" id="tx-ver-caixa" hidden><iframe id="tx-ver-quadro" title="O que o terminal ligou" allow="microphone; camera; autoplay; fullscreen; clipboard-read; clipboard-write"></iframe></div></div>' +
      (PC ? '' : '<details class="lab-det"><summary>Não conectou?</summary><ul class="lab-ul">' +
      '<li>O Termux precisa estar <b>aberto</b> com o comando 2 rodando (aparece "Listening on port: 7681").</li>' +
      '<li>Configurações do Android → Apps → Termux → Bateria: <b>Sem restrições</b>.</li>' +
      '<li>No Chrome: se aparecer pedido de acesso a "dispositivos da rede local", toque em <b>Permitir</b>.</li>' +
      '<li>Abra o Laboratório <b>publicado</b> (https) ou pelo <b>APK</b> do Mini SK. Aberto como arquivo do celular, o Chrome às vezes bloqueia.</li>' +
      '<li>No computador: abra o Laboratório <b>pelo Mini SK do PC</b> (botão 🌐 Abrir como app) para usar o terminal do computador.</li></ul></details>');
    if ($('#tx-url')) $('#tx-url').value = pref.get('termuxUrl', PADRAO);
    $('#tx-porta').value = pref.get('portaVer', 5173);
    const enderecoVer = () => { const p = parseInt($('#tx-porta').value, 10); if (!(p > 0 && p < 65536)) { LB.aviso('Porta inválida', 'erro'); return null; } pref.set('portaVer', p); return 'http://127.0.0.1:' + p + '/'; };
    $('#tx-ver').onclick = () => { const u = enderecoVer(); if (!u) return; $('#tx-ver-caixa').hidden = false; $('#tx-ver-quadro').src = u + '?t=' + Date.now(); };
    $('#tx-ver-fora').onclick = () => { const u = enderecoVer(); if (u) window.open(u, '_blank'); };
    const rodarP = (fn) => fn().catch((e) => pst('⚠ ' + e.message, 'erro'));
    $('#tx-tudo').onclick = () => rodarP(async () => { await ligarTudo(); pref.set('termuxJaLigou', true); });
    $('#tx-rodar').onclick = () => rodarProjeto();
    $('#tx-parar').onclick = () => { enviar('\x03'); if (term) term.focus(); };
    $('#tx-ollama').onclick = () => rodarP(ligarOllama);
    if ($('#tx-sem-cair')) $('#tx-sem-cair').onclick = () => { if (!ligado()) return pst('Toque em ▶ Ligar tudo primeiro.', 'erro'); enviar(CMD_SEM_CAIR() + '\r'); };
    if ($('#tx-p-ligar')) $('#tx-p-ligar').onclick = () => rodarP(async () => { pst('Ligando a ponte… (na 1ª vez pode instalar o Node: uns minutos)'); await ligarPonte((t) => pst(t)); pst('✅ Ponte ligada.', 'ok'); });
    $('#tx-p-mandar').onclick = () => rodarP(async () => { pst('Mandando…'); const r = await mandarProjeto(); pst('✅ ' + r.n + ' arquivo(s) em ' + r.pasta + (r.pulados.length ? ' · pulados: ' + r.pulados.length : '') + '. Já entrei na pasta.', 'ok'); });
    $('#tx-p-trazer').onclick = () => rodarP(async () => { pst('Trazendo…'); const r = await trazer(); pst('✅ Trazidos: ' + r.novos + ' novo(s), ' + r.mudou + ' mudado(s)' + (r.cortou ? ' (parte ficou de fora: grande demais)' : '') + '.', 'ok'); });
    $('#tx-con').onclick = () => conectar();
    $('#tx-des').onclick = () => desconectar();
    $('#tx-ia').onclick = () => {
      const linhas = saida.split('\n').slice(-60).join('\n').trim();
      if (!linhas) return LB.aviso('O terminal ainda está vazio.', 'erro');
      LB.irAba('ia'); setTimeout(() => LB.ia.colar('Saída do terminal' + (projAtual() ? ' (projeto "' + projAtual().nome + '")' : ''), '```\n' + linhas + '\n```'), 50);
    };
    const letra = (d) => { const n = Math.max(9, Math.min(28, pref.get('termFonte', 14) + d)); pref.set('termFonte', n); if (term) { term.options.fontSize = n; try { fit.fit(); tamanho(); } catch (e) {} } const pre = $('#tx-pre'); if (pre) pre.style.fontSize = n + 'px'; };
    $('#tx-menos').onclick = () => letra(-1); $('#tx-mais').onclick = () => letra(1);
    $('#tx-limpar').onclick = () => { if (term) term.clear(); else if ($('#tx-pre')) $('#tx-pre').textContent = ''; };
    el.addEventListener('click', (e) => {
      const c = e.target.closest('[data-copiar]'); if (c) copiar(c.dataset.copiar === '1' ? CMD_INSTALAR : CMD_LIGAR);
      const t = e.target.closest('[data-t]'); if (t) { enviar(t.dataset.t); if (term) term.focus(); }
      const pt = e.target.closest('[data-porta]'); if (pt) { $('#tx-porta').value = pt.dataset.porta; $('#tx-ver').click(); }
      const m = e.target.closest('[data-cmd]'); if (m) { if (!ligado()) pst('Toque em ▶ Ligar tudo primeiro.', 'erro'); else enviar(m.dataset.cmd + '\r'); }
    });
    if (PC) setTimeout(() => { if (!ligado()) conectar(); }, 300); // no PC o terminal está sempre pronto
  }

  window.addEventListener('lab-aba', (e) => { if (e.detail === 'terminal') tela(); });
  return { tela, conectar, desconectar, ligarPonte, mandarProjeto, trazer, ligarTudo, planoLigar, get ligado() { return ligado(); }, get noPC() { return !!PC; } };
})();
