# Balcão Visit Braga

**Fonte de verdade interna do posto de turismo do Município de Braga.**

Quando um turista chega ao posto e pergunta *“o que há este fim de semana?”* ou
*“o museu abre à segunda?”*, quem está ao balcão tem de responder em segundos — e
com informação **atual**. O Balcão existe para isso: reúne **o que há na cidade** e a
**ficha sempre atual** de cada operador e espaço (horários, *aberto agora?*, contactos,
localização, avisos), mantida pelas **próprias entidades**.

> Não é para publicar nada nas redes do Visit Braga. É uma ferramenta interna de
> consulta e um registo que se mantém atual sozinho, porque cada entidade trata da sua ficha.

## Porque não basta um Google Calendar

| | Google Calendar | Balcão |
|---|---|---|
| Eventos com data | ✅ | ✅ |
| **Estado atual** (horário, *aberto agora?*, avisos) | ❌ | ✅ |
| Ficha de cada operador/espaço (contactos, localização, bom saber) | ❌ | ✅ |
| **Mantido pelas próprias entidades** | ❌ | ✅ |
| Pesquisa pensada para responder ao turista ao balcão | ❌ | ✅ |
| Mapa da cidade | ❌ | ✅ |

## Três papéis

- **Entidade** — mantém a sua ficha atual (horário, estado, contactos, etiquetas) e
  comunica o que há (eventos, novidades, cartazes, alterações de horário).
- **Divisão de Turismo (admin)** — gere o registo de entidades, aprova, trata as
  comunicações e vê os indicadores (incluindo fichas desatualizadas).
- **Posto de Turismo (balcão)** — consulta. É a vista feita para responder ao turista.

## Funcionalidades

- **Balcão** — pesquisa grande, janelas *Hoje / Fim de semana / Esta semana / Tudo*,
  filtros (*aberto agora*, família, grátis…) e a **ficha-resposta** de cada entidade com
  o estado *aberto agora · fecha às 18:00* calculado a partir do horário.
- **Ficha da entidade** — editor completo com pré-visualização ao vivo do que o posto vê,
  editor de horário semanal (intervalos por dia) e aviso temporário.
- **Registo** — lista oficial das entidades, com **frescura** da informação
  (*atualizada há X*) e destaque para as desatualizadas; aprovar/suspender; criar.
- **Mapa** — todas as entidades no mapa de Braga (Leaflet), com ficha ao clicar.
- **Agenda** — calendário de apoio + exportação CSV.
- **Indicadores** — saúde do registo e pulso do que há.

## Stack

Next.js 14 (App Router) · TypeScript · CSS próprio · Firebase (Auth + Firestore) ·
Leaflet / react-leaflet (mapa). Sem Tailwind.

## Modo demo (predefinição)

Sem variáveis de ambiente, a app corre **em memória** (persistida no `localStorage`),
totalmente funcional. Ideal para experimentar.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000> e entra com uma das contas demo (palavra-passe `demo`):

| Papel | Email | Vê |
|---|---|---|
| Posto de turismo | `posto@visitbraga.pt` | Balcão + Mapa |
| Divisão (admin) | `admin@visitbraga.pt` | Balcão, Registo, Comunicações, Agenda, Mapa, Indicadores |
| Entidade | `operador@visitbraga.pt` | Painel, A minha ficha, O que há |

> O mapa precisa de ligação à internet em tempo de execução (carrega os *tiles* do
> OpenStreetMap). O *login* com Google só funciona em `localhost` ou Vercel — não dentro
> do iframe do StackBlitz.

## Modo Firebase

1. Copia `.env.local.example` para `.env.local` e preenche os `NEXT_PUBLIC_FIREBASE_*`.
2. Cola as **regras de arranque** (`firestore.rules`) no Firestore.
3. Cria `admin@visitbraga.pt` na Firebase Auth Console (palavra-passe ≥ 6).
4. Abre `/setup` → **Inicializar dados** → **Tornar-me administrador**.
5. Mais tarde, troca para as **regras restritas** (`firestore.rules.locked`).

A app deteta o Firebase automaticamente quando `NEXT_PUBLIC_FIREBASE_API_KEY` está definida.

## Estrutura

```
app/
  (entidade)/        painel · ficha · comunicacoes      (papel: entidade)
  admin/             balcao · registo · comunicacoes · agenda · mapa · painel
  balcao/            balcao · mapa                       (papel: posto)
  login · setup · page.tsx (encaminhamento por papel)
components/
  Balcao · EntityFiche · HoursEditor · EntitiesMap · MapaEntidades · Shell · ui/*
lib/
  types · utils · seed · store · data · auth · firebase · firestore-seed · toast · useEntity
```
