# Ratio — Contexto do Projeto

App de gestão de estudos (React 19 + TypeScript + Vite + Tailwind + Firebase), PWA mobile-first em português.

## Comandos

- `npm run dev` — servidor de desenvolvimento (localhost:5173)
- `npm run build` — typecheck + build de produção
- `npm run lint` — ESLint
- `npm run test:rules` — testes de segurança das Firestore rules no emulador (**requer Java**; Temurin 21 instalado em `C:\Program Files\Eclipse Adoptium\jre-21.0.11.10-hotspot`)
- `npm start` — emuladores do Firebase

## Deploy e infraestrutura

- **Hospedagem: Vercel** → https://ratio-eight.vercel.app/ — deploy automático a cada `git push` na main (GitHub landerfilipe/ratio).
- **Security headers e CSP (modo enforcing)** ficam em `vercel.json`. Se o login Google ou imagens quebrarem após mudança, conferir `frame-src`, `connect-src` e `img-src` lá. Não usa Firebase Hosting.
- **Firestore rules**: publicar com `firebase deploy --only firestore:rules` (CLI já autenticada). **Sempre rodar `npm run test:rules` antes de publicar.**
- **API key do Firebase é restrita** no Google Cloud Console: referrers `ratio-eight.vercel.app/*`, `ratio-5bfb8.firebaseapp.com/*`, `localhost:5173/*`, `localhost:4173/*`; APIs permitidas: Identity Toolkit, Token Service, Cloud Firestore. **Novo domínio = adicionar referrer lá e no CSP.**

## Decisões de produto (não reverter sem pedir)

- **Login somente Google.** O provedor anônimo está desativado de propósito no Firebase Console e a tentativa automática de login anônimo foi removida do `App.tsx`. A lógica de `linkWithPopup` foi mantida caso o modo convidado volte um dia.
- **Uso mínimo do Firestore é requisito**: exatamente 1 `onSnapshot` na coleção de sessões + 1 `getDoc` do perfil por sessão de uso; escritas só em ação do usuário. Não adicionar listeners/leituras sem necessidade clara.
- O timer conta por **timestamp de âncora** (não por incremento de intervalo) para não perder tempo quando o PWA é suspenso em background — manter assim.

## Arquitetura

- `src/App.tsx` (~3000 linhas) concentra auth, Firestore, timer, views (home/timer/statistics/calendar/history/profile) via estado `view` — não há router.
- `src/views/StatisticsView.tsx` é lazy-loaded e contém todo o Recharts (fica fora do bundle inicial e do precache do service worker — preservar isso).
- `src/lib/firebase.ts` — config + cache offline multi-aba (`persistentMultipleTabManager`).
- `tests/firestore-rules.test.mjs` — 19 testes das rules (isolamento entre usuários, validação de campos, photoUrl só https, etc.).
- Firestore: `artifacts/ratio-5bfb8/users/{uid}/study_sessions/*` e `.../profile/main`.

## Cuidados

- Preservar UI/textos/visual — o dono do app preza por não quebrar comportamento existente.
- Mudanças arriscadas em etapas validáveis (ex.: CSP entrou primeiro como Report-Only, depois enforcing).
- Vulnerabilidades restantes do `npm audit` estão todas na árvore interna do `firebase-tools` (dev-only, sem fix disponível) — não tentar `npm audit fix --force`.
