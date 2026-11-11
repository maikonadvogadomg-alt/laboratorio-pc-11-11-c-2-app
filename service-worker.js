// service-worker.js — gerado pelo Mini SK em 11/11/2026, 03:16:23
// Não precisa mexer: ele guarda sozinho o que o app usa.
const PREFIXO = 'sk-laboratorio-pc-c-';
const CACHE = PREFIXO + 'mwbq7aka';
// Lista feita automaticamente (para funcionar sem internet logo após instalar)
const GUARDAR = [
  "./",
  "./app/css/app.css",
  "./app/css/extra.css",
  "./app/favicon.ico",
  "./app/ferramentas/ai-code-studio.html",
  "./app/ferramentas/arrumador.html",
  "./app/ferramentas/colador.html",
  "./app/ferramentas/faxina.html",
  "./app/ferramentas/iara-suite.html",
  "./app/ferramentas/juntador.html",
  "./app/ferramentas/meu-chat/css/app.css",
  "./app/ferramentas/meu-chat/icons/icon-192.png",
  "./app/ferramentas/meu-chat/icons/icon-512.png",
  "./app/ferramentas/meu-chat/index.html",
  "./app/ferramentas/meu-chat/js/00-base.js",
  "./app/ferramentas/meu-chat/js/10-banco.js",
  "./app/ferramentas/meu-chat/js/20-provedores.js",
  "./app/ferramentas/meu-chat/js/30-memoria.js",
  "./app/ferramentas/meu-chat/js/33-contextos.js",
  "./app/ferramentas/meu-chat/js/35-jeito.js",
  "./app/ferramentas/meu-chat/js/40-voz.js",
  "./app/ferramentas/meu-chat/js/50-internet.js",
  "./app/ferramentas/meu-chat/js/60-previa.js",
  "./app/ferramentas/meu-chat/js/70-texto.js",
  "./app/ferramentas/meu-chat/js/80-chat.js",
  "./app/ferramentas/meu-chat/js/85-config.js",
  "./app/ferramentas/meu-chat/js/87-cofre.js",
  "./app/ferramentas/meu-chat/js/90-backup.js",
  "./app/ferramentas/meu-chat/js/95-ponte-lab.js",
  "./app/ferramentas/meu-chat/js/99-app.js",
  "./app/ferramentas/meu-chat/js/lib/cofre-arquivo.js",
  "./app/ferramentas/meu-chat/js/lib/guia-maikon.js",
  "./app/ferramentas/meu-chat/LEIA-ME.txt",
  "./app/ferramentas/meu-chat/manifest.json",
  "./app/ferramentas/meu-chat/sw.js",
  "./app/ferramentas/montador.html",
  "./app/ferramentas/numerador.html",
  "./app/ferramentas/picotador.html",
  "./app/ferramentas/preparador.html",
  "./app/ferramentas/projeto-lab.html",
  "./app/ferramentas/replicador.html",
  "./app/icons/apple-touch-icon.png",
  "./app/icons/icon-16.png",
  "./app/icons/icon-32.png",
  "./app/icons/icon-48.png",
  "./app/icons/icon-72.png",
  "./app/icons/icon-96.png",
  "./app/icons/icon-128.png",
  "./app/icons/icon-144.png",
  "./app/icons/icon-152.png",
  "./app/icons/icon-180.png",
  "./app/icons/icon-192.png",
  "./app/icons/icon-384.png",
  "./app/icons/icon-512.png",
  "./app/icons/icon.svg",
  "./app/icons/maskable-192.png",
  "./app/icons/maskable-512.png",
  "./app/icons/maskable.svg",
  "./app/index.html",
  "./app/js/00-base.js",
  "./app/js/10-banco.js",
  "./app/js/20-importar.js",
  "./app/js/30-analise.js",
  "./app/js/40-plano.js",
  "./app/js/50-comparar.js",
  "./app/js/60-ferramentas.js",
  "./app/js/70-ia.js",
  "./app/js/75-memoria.js",
  "./app/js/80-terminal.js",
  "./app/js/99-app.js",
  "./app/kits/juntar.py",
  "./app/kits/kit-replit.cjs",
  "./app/kits/organizar.py",
  "./app/kits/servir.py",
  "./app/LEIA-ME.txt",
  "./app/lib/acorn.min.js",
  "./app/lib/jszip.min.js",
  "./app/manifest.json",
  "./app/service-worker.js",
  "./electron/instalar.nsh",
  "./electron/main.cjs",
  "./electron/navegador.html",
  "./electron/ponte.cjs",
  "./electron/preload-nav.cjs",
  "./electron/preload.cjs",
  "./electron/saude.cjs",
  "./electron/terminal.cjs",
  "./favicon.ico",
  "./icons/apple-touch-icon.png",
  "./icons/icon-16.png",
  "./icons/icon-32.png",
  "./icons/icon-48.png",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/icon.svg",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./icons/maskable.svg",
  "./index.html",
  "./LEIA-ME.md",
  "./manifest.json",
  "./package.json",
  "./PLANO.md"
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(GUARDAR.map((u) => c.add(u).catch(() => null)))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIXO) && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primeiro a internet (sempre a versão nova); sem internet, a cópia guardada.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      // Igual ao Workbox da Replit: página que não existe (rota do app) abre o index
      if (res.status === 404 && req.mode === 'navigate') return caches.match('./').then((r) => r || fetch('./'));
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
