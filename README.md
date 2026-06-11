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
GROQ_DEBUG=0
VITE_REPORT_DEBUG=0
```

`GROQ_API_KEY` é uma variável exclusiva do servidor. Nunca use o prefixo `VITE_`.

Para auditar temporariamente a origem dos relatórios no navegador, use
`VITE_REPORT_DEBUG=1`. A página exibirá origem, ID da requisição, duração e motivo
do fallback. Em desenvolvimento com Vite, essa identificação já aparece automaticamente.

O backend registra eventos JSON `mini_report_success` e `mini_report_fallback`.
Use o `requestId` exibido na página ou no console do navegador para localizar a mesma
requisição nos logs do terminal ou da função na Vercel. `GROQ_DEBUG=1` acrescenta
diagnóstico de guardrails nos logs do servidor e não deve ser necessário no uso normal.

### Inspetor temporário da Groq

Em desenvolvimento, o relatório exibe um painel com o histórico das últimas 10 chamadas:
entrada recebida, cenário calculado, prompt/payload enviado, resposta da Groq, tokens,
validação estrutural, guardrails e resultado entregue. O header de autorização sempre
aparece como `[REDACTED]`.

Esse recurso é temporário. Para localizá-lo e removê-lo, procure por:

```text
TEMP_GROQ_DEBUG
```

As marcações estão concentradas em `api/mini-relatorio.ts`,
`src/lib/inteligenciaReport.ts` e
`src/components/terceiraInteligencia/AdaptiveMiniReport.tsx`.

## Backend

A função `api/mini-relatorio.ts` está pronta para Vercel. Se o backend for migrado para Railway, configure a URL pública da API no frontend e restrinja CORS ao domínio definitivo.
