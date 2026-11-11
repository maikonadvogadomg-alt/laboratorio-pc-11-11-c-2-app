# 📋 Plano do projeto: Laboratorio-PC-11-11-C (2)

_Gerado em 11/11/2026, 03:16:41 — sem IA, lendo os arquivos._

## 📊 Visão geral
| Item | Valor |
|---|---|
| Arquivos | 112 |
| Linhas | 16.190 |
| Telas/páginas | 16 |
| Rotas do backend | 0 |
| Chamadas do app | 0 |
| Tabelas do banco | 0 |
| Variáveis de ambiente | 8 |

**Linguagens:** JavaScript (41), Imagem (32), HTML (16), Outros (4), JSON (4), Imagem SVG (4), CSS (3), Python (3), Ícone (2), Markdown (2), YAML (1)

## 💡 O que fazer (em ordem)
1. 🧹 Tirar a Replit de 8 arquivo(s) (🏗️ Preparar → Fazer tudo)
2. 🔐 Criar um .env.example com: BASE_PATH, DADOS_EM, LOCALAPPDATA, PONTE_BASE, PONTE_CODIGO, PONTE_PORTA, PORT, TESTE_SAIR (os valores você coloca no servidor, nunca no código)
3. 📝 Criar um README.md explicando como rodar

## 🚀 Por onde começa
- `app/ferramentas/meu-chat/index.html`
- `app/index.html`
- `index.html`

## ⌨️ Comandos (package.json)
| Pasta | Comando | O que roda |
|---|---|---|
| . | `npm run programa` | `electron .` |
| . | `npm run exe` | `electron-builder --win nsis portable --x64 --publish never` |

## 📱 Telas e páginas
| Endereço | Arquivo |
|---|---|
| `app/ferramentas/ai-code-studio.html` | app/ferramentas/ai-code-studio.html |
| `app/ferramentas/arrumador.html` | app/ferramentas/arrumador.html |
| `app/ferramentas/colador.html` | app/ferramentas/colador.html |
| `app/ferramentas/faxina.html` | app/ferramentas/faxina.html |
| `app/ferramentas/iara-suite.html` | app/ferramentas/iara-suite.html |
| `app/ferramentas/juntador.html` | app/ferramentas/juntador.html |
| `app/ferramentas/meu-chat/index.html` | app/ferramentas/meu-chat/index.html |
| `app/ferramentas/montador.html` | app/ferramentas/montador.html |
| `app/ferramentas/numerador.html` | app/ferramentas/numerador.html |
| `app/ferramentas/picotador.html` | app/ferramentas/picotador.html |
| `app/ferramentas/preparador.html` | app/ferramentas/preparador.html |
| `app/ferramentas/projeto-lab.html` | app/ferramentas/projeto-lab.html |
| `app/ferramentas/replicador.html` | app/ferramentas/replicador.html |
| `app/index.html` | app/index.html |
| `electron/navegador.html` | electron/navegador.html |
| `index.html` | index.html |

## 🖥️ Rotas do backend
_Nenhum encontrado._

## 📡 O que o app pede ao servidor
_Nenhum encontrado._

## 🔌 O que falta no backend
✅ Tudo que o app chama tem rota no projeto (ou o app não usa servidor).

## 🗄️ Banco de dados
_Nenhuma tabela encontrada._

## 🔐 Variáveis de ambiente (configurar no servidor)
- `BASE_PATH`
- `DADOS_EM`
- `LOCALAPPDATA`
- `PONTE_BASE`
- `PONTE_CODIGO`
- `PONTE_PORTA`
- `PORT`
- `TESTE_SAIR`

_Só os nomes. Os valores (chaves, senhas) nunca vão no código nem no GitHub._

## 🤖 IA usada
- generativelanguage.googleapis.com
- api.groq.com
- console.groq.com
- openrouter.ai
- api.openai.com
- platform.openai.com
- api.anthropic.com
- console.anthropic.com

## 🌐 Serviços de fora que ele acessa
- aistudio.google.com
- api-dashboard.search.brave.com
- api.anthropic.com
- api.deepseek.com
- api.groq.com
- api.openai.com
- api.perplexity.ai
- api.search.brave.com
- api.tavily.com
- app.tavily.com
- cdn.jsdelivr.net
- cdn.tailwindcss.com
- console.anthropic.com
- console.groq.com
- generativelanguage.googleapis.com
- github.com
- google.serper.dev
- meuchat.local
- ollama.com
- openrouter.ai
- platform.deepseek.com
- platform.openai.com
- r.jina.ai
- raw.github.com
- serper.dev
- stuartk.com
- stuk.github.io
- unpkg.com
- www.perplexity.ai

## 📦 Peças principais (dependências)
`ws`

## 🧹 Arquivos com coisa da Replit
- app/ferramentas/meu-chat/js/33-contextos.js
- app/ferramentas/meu-chat/js/lib/guia-maikon.js
- app/js/60-ferramentas.js
- app/kits/kit-replit.cjs
- app/kits/organizar.py
- app/kits/servir.py
- app/service-worker.js
- service-worker.js

## 🔁 Roteiro para recriar fora da Replit
1. Importar o projeto no Mini SK e tocar em 🏗️ Preparar → ✅ Fazer tudo (tira a Replit, cria os arquivos que faltam).
2. Não tem backend: o site sozinho basta (Netlify ou GitHub Pages).
3. Variáveis: cadastrar 8 variável(is) no servidor (lista acima).
4. Testar a prévia; se der erro, 🤖 Mandar os erros para a IA.
5. App: 📲 Instalável (PWA), 📦 APK ou 🖥️ Desktop (.exe) pelo 🏗️ Preparar.

## 🌳 Árvore de arquivos
```
├─ 📁 .github/
│  └─ 📁 workflows/
│     └─ programa-exe.yml
├─ 📁 app/
│  ├─ 📁 css/
│  │  ├─ app.css
│  │  └─ extra.css
│  ├─ 📁 ferramentas/
│  │  ├─ 📁 meu-chat/
│  │  │  ├─ 📁 css/
│  │  │  │  └─ app.css
│  │  │  ├─ 📁 icons/
│  │  │  │  ├─ icon-192.png
│  │  │  │  └─ icon-512.png
│  │  │  ├─ 📁 js/
│  │  │  │  ├─ 📁 lib/
│  │  │  │  │  ├─ cofre-arquivo.js
│  │  │  │  │  └─ guia-maikon.js
│  │  │  │  ├─ 00-base.js
│  │  │  │  ├─ 10-banco.js
│  │  │  │  ├─ 20-provedores.js
│  │  │  │  ├─ 30-memoria.js
│  │  │  │  ├─ 33-contextos.js
│  │  │  │  ├─ 35-jeito.js
│  │  │  │  ├─ 40-voz.js
│  │  │  │  ├─ 50-internet.js
│  │  │  │  ├─ 60-previa.js
│  │  │  │  ├─ 70-texto.js
│  │  │  │  ├─ 80-chat.js
│  │  │  │  ├─ 85-config.js
│  │  │  │  ├─ 87-cofre.js
│  │  │  │  ├─ 90-backup.js
│  │  │  │  ├─ 95-ponte-lab.js
│  │  │  │  └─ 99-app.js
│  │  │  ├─ index.html
│  │  │  ├─ LEIA-ME.txt
│  │  │  ├─ manifest.json
│  │  │  └─ sw.js
│  │  ├─ ai-code-studio.html
│  │  ├─ arrumador.html
│  │  ├─ colador.html
│  │  ├─ faxina.html
│  │  ├─ iara-suite.html
│  │  ├─ juntador.html
│  │  ├─ montador.html
│  │  ├─ numerador.html
│  │  ├─ picotador.html
│  │  ├─ preparador.html
│  │  ├─ projeto-lab.html
│  │  └─ replicador.html
│  ├─ 📁 icons/
│  │  ├─ apple-touch-icon.png
│  │  ├─ icon-128.png
│  │  ├─ icon-144.png
│  │  ├─ icon-152.png
│  │  ├─ icon-16.png
│  │  ├─ icon-180.png
│  │  ├─ icon-192.png
│  │  ├─ icon-32.png
│  │  ├─ icon-384.png
│  │  ├─ icon-48.png
│  │  ├─ icon-512.png
│  │  ├─ icon-72.png
│  │  ├─ icon-96.png
│  │  ├─ icon.svg
│  │  ├─ maskable-192.png
│  │  ├─ maskable-512.png
│  │  └─ maskable.svg
│  ├─ 📁 js/
│  │  ├─ 00-base.js
│  │  ├─ 10-banco.js
│  │  ├─ 20-importar.js
│  │  ├─ 30-analise.js
│  │  ├─ 40-plano.js
│  │  ├─ 50-comparar.js
│  │  ├─ 60-ferramentas.js
│  │  ├─ 70-ia.js
│  │  ├─ 75-memoria.js
│  │  ├─ 80-terminal.js
│  │  └─ 99-app.js
│  ├─ 📁 kits/
│  │  ├─ juntar.py
│  │  ├─ kit-replit.cjs
│  │  ├─ organizar.py
│  │  └─ servir.py
│  ├─ 📁 lib/
│  │  ├─ acorn.min.js
│  │  └─ jszip.min.js
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ LEIA-ME.txt
│  ├─ manifest.json
│  └─ service-worker.js
├─ 📁 electron/
│  ├─ instalar.nsh
│  ├─ main.cjs
│  ├─ navegador.html
│  ├─ ponte.cjs
│  ├─ preload-nav.cjs
│  ├─ preload.cjs
│  ├─ saude.cjs
│  └─ terminal.cjs
├─ 📁 icons/
│  ├─ apple-touch-icon.png
│  ├─ icon-128.png
│  ├─ icon-144.png
│  ├─ icon-152.png
│  ├─ icon-16.png
│  ├─ icon-180.png
│  ├─ icon-192.png
│  ├─ icon-32.png
│  ├─ icon-384.png
│  ├─ icon-48.png
│  ├─ icon-512.png
│  ├─ icon-72.png
│  ├─ icon-96.png
│  ├─ icon.svg
│  ├─ maskable-192.png
│  ├─ maskable-512.png
│  └─ maskable.svg
├─ .gitignore
├─ favicon.ico
├─ index.html
├─ LEIA-ME.md
├─ manifest.json
├─ package.json
├─ PLANO.md
└─ service-worker.js
```
