# Sistema Galuno — Precificação e Vendas

App web da equipe, com login e dados salvos na nuvem (Supabase). Baseado no seu
sistema original, agora pronto para publicar no Vercel.

## O que tem aqui

- `index.html` — página base (carrega o Tailwind via CDN).
- `src/App.jsx` — o seu sistema completo (produtos, insumos, fábricas, marketplaces, vendas, financeiro, estoque, importadores). Praticamente igual ao original.
- `src/main.jsx` — liga o app ao login e ao salvamento na nuvem; adiciona o botão "Sair".
- `src/Login.jsx` — tela de login por e-mail e senha.
- `src/supabaseClient.js` — endereço do banco + chave publicável (valores públicos e seguros).
- `src/storage.js` — salva/carrega os dados na tabela `app_estado` do Supabase.

## Como funciona o salvamento

O app continua salvando sozinho (com o mesmo aviso de "salvo") — só que agora
na "caixa única" do Supabase, acessível por qualquer computador da equipe que
faça login. Enquanto estivermos nessa fase, combine que **só uma pessoa registra
venda por vez** (na Fase 2 movemos Vendas/Estoque para tabelas próprias e isso
deixa de importar).

## Rodar no seu PC (opcional, para testar)

Precisa do Node instalado. Na pasta do projeto:

```
npm install
npm run dev
```

## Publicar (resumo — o passo a passo detalhado está em "guia-publicacao.md")

1. Suba esta pasta para um repositório no GitHub.
2. No Vercel: New Project → importe o repositório → Deploy (ele detecta Vite sozinho).
3. Abra a URL gerada e faça login com um usuário criado no Supabase.

Não precisa configurar variáveis de ambiente: a URL e a chave publicável já
estão no código (são valores públicos). Se preferir, dá para movê-las para as
Environment Variables do Vercel (`VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY`).

> Observação: o Tailwind está via CDN para simplificar. Funciona bem para uso
> interno; se um dia quiser, migramos para o Tailwind "de build" (sem o aviso
> de produção no console).
