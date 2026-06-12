# Pinheiro Azul Inteligência

Projeto independente do scanner imobiliário da Pinheiro Azul.

## Rotas

- `/`: scanner definitivo
- `/legal`: central de privacidade e documentos legais
- `/privacidade`
- `/tratamento-de-dados`
- `/direitos-lgpd`
- `/cookies`
- `/termos`

`/3inteligencia` redireciona para `/` por compatibilidade.

## Desenvolvimento

```bash
npm install
npm run dev
```

O servidor Vite executa `api/mini-relatorio.ts` por meio de um middleware local,
portanto `npm run dev` também testa a integração real com a Groq usando o `.env`.

Para testar frontend e função no formato Vercel:

```bash
npx vercel dev
```

## Produção

```bash
npm run test
npm run build
```

O frontend é gerado em `dist/`.

## Variáveis

Crie `.env` a partir de `.env.example`:

```env
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
```

`GROQ_API_KEY` é uma variável exclusiva do servidor. Nunca use o prefixo `VITE_`.

O backend registra eventos JSON `mini_report_success` e `mini_report_fallback`.
Use o `requestId` registrado no console do navegador para correlacionar a requisição
com os logs do terminal ou da função na Vercel. O backend não retorna prompt, payload,
resposta bruta ou raciocínio do provedor ao navegador.

O rate limit em memória protege o desenvolvimento e cada instância isolada. Em produção,
configure também rate limiting distribuído no firewall ou gateway da plataforma.

## Backend

A função `api/mini-relatorio.ts` está pronta para Vercel. Se o backend for migrado para Railway, configure a URL pública da API no frontend e restrinja CORS ao domínio definitivo.
