---
name: Metta Estudantil — Assessoria Layla Panini
description: Assessoria de documentação FIES e ProUni liderada por quem viveu o processo
colors:
  marinho: "#082C40"
  electrico: "#1663E0"
  verde-vaga: "#167F43"
  branco: "#FFFFFF"
  nevoa: "#F2F6FC"
  borda-suave: "#DCE6F4"
  borda-media: "#B9CDEB"
  azul-claro-escuro: "#8DB4F5"
  texto-escuro-invertido: "#C4D4E6"
  texto-secundario: "#4A5A6B"
  texto-paragrafo: "#33475B"
  quase-preto: "#0B1B2B"
  verde-indicador: "#3DDC84"
  topbar: "#061F2E"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
    fontSize: "clamp(44px, 6vw, 80px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
    fontSize: "clamp(34px, 4.2vw, 56px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  serif-accent:
    fontFamily: "'Instrument Serif', Georgia, serif"
    fontSize: "1em"
    fontWeight: 400
    fontStyle: italic
  title:
    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
    fontSize: "clamp(24px, 2.6vw, 32px)"
    fontWeight: 800
    lineHeight: 1.15
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "0em"
  label-uppercase:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  pill: "999px"
  card-lg: "28px"
  card-md: "24px"
  card-sm: "20px"
  card-xs: "16px"
  logo: "12px"
  testimonial: "18px"
  badge: "999px"
spacing:
  section-v: "120px"
  section-v-lg: "128px"
  container-h: "24px"
  container-max: "1280px"
  card-pad-lg: "44px"
  card-pad-md: "32px"
  card-pad-sm: "22px"
components:
  button-primary:
    backgroundColor: "{colors.electrico}"
    textColor: "{colors.branco}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "#0B4BB3"
    transform: "translateY(-2px)"
    boxShadow: "0 16px 30px -14px rgba(22,99,224,.7)"
  button-green:
    backgroundColor: "{colors.verde-vaga}"
    textColor: "{colors.branco}"
    rounded: "{rounded.pill}"
    padding: "0 30px"
    height: "60px"
  button-green-hover:
    backgroundColor: "#0F6B37"
    transform: "translateY(-2px)"
    boxShadow: "0 16px 30px -14px rgba(22,127,67,.7)"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.marinho}"
    border: "1.5px solid {colors.borda-media}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "50px"
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.branco}"
    border: "1.5px solid rgba(255,255,255,.3)"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "54px"
---

# DESIGN.md — Metta Estudantil · Assessoria Layla Panini

## Overview

**Estrela do Norte:** *A Burocracia Domada* — este design existe para transformar o caos burocrático do FIES e ProUni em um caminho claro, possível e seguro. Cada decisão visual comunica controle, clareza e confiança: o aluno chega perdido e sai com um plano.

**Mood:** Técnico mas acolhedor. O rigor clínico de quem domina os processos institucionais, temperado pela empatia de quem passou pelo mesmo caminho. Nunca frio, nunca genérico, sempre próximo.

O design usa uma paleta predominantemente azul-marinha para transmitir credibilidade institucional, intercalada com seções em azul-névoa para respiração, e o verde WhatsApp como único verde — reservado exclusivamente para conversão. A tipografia combina a objetividade moderna do Plus Jakarta Sans (heavy, tight-tracked) com o calor sutil do Instrument Serif italic para momentos emocionais.

A voz visual é: **"Eu já fui o seu lugar. Deixa eu te mostrar o caminho."**

---

## Colors

### Paleta Principal

| Token | Hex | Nome Descritivo | Uso |
|-------|-----|-----------------|-----|
| `marinho` | `#082C40` | **Marinho Profundo** | Fundo de seções escuras, nav, rodapé, tipografia de alta hierarquia |
| `electrico` | `#1663E0` | **Azul Elétrico** | CTAs primários, marcadores de seção, links, estados hover |
| `verde-vaga` | `#167F43` | **Verde da Vaga** | *Exclusivo* para botões WhatsApp e FAB — sinal de conversão |
| `branco` | `#FFFFFF` | Branco Puro | Fundo de página, cards, superfícies |
| `nevoa` | `#F2F6FC` | **Névoa Formulário** | Fundo de seções alternadas (como-funciona, duvidas, depoimentos) |

### Paleta de Suporte

| Token | Hex | Nome Descritivo | Uso |
|-------|-----|-----------------|-----|
| `borda-suave` | `#DCE6F4` | Aço Suave | Bordas de cards, divisores, contornos de testimonials |
| `borda-media` | `#B9CDEB` | Periwinkle Muted | Bordas de ghost buttons, círculos decorativos |
| `azul-claro-escuro` | `#8DB4F5` | Azul Céu | Texto de label em seções escuras (Marinho Profundo) |
| `texto-escuro-invertido` | `#C4D4E6` | Cinza Azulado | Corpo de texto em fundos escuros |
| `texto-secundario` | `#4A5A6B` | Ardósia | Texto secundário em fundos brancos, labels de stats |
| `texto-paragrafo` | `#33475B` | Aço Médio | Parágrafos em contextos de médio contraste |
| `quase-preto` | `#0B1B2B` | Quase-Preto | Texto de máximo contraste em branco |
| `verde-indicador` | `#3DDC84` | Verde Indicador | Ponto na topbar, ícones de checklist no card Assessoria |
| `topbar` | `#061F2E` | Azul Meia-Noite | Fundo exclusivo da barra superior |

### Regras de Cor

> [!IMPORTANT]
> **Verde da Vaga é exclusivo.** `#167F43` só aparece em CTAs de WhatsApp e no FAB flutuante. Nunca use em decoração, backgrounds ou elementos informativos — seu significado semântico é "clique e fale agora".

> [!NOTE]
> **Nunca misture Marinho Profundo com verde na mesma superfície** sem o Azul Elétrico como mediador. O contraste tricolor só funciona com hierarquia clara: Marinho fundo → Azul Elétrico destaque → Verde Vaga ação.

### Layering de Seções (ordem na página)

```
Topbar     →  #061F2E  (Azul Meia-Noite)
Nav/Hero   →  #FFFFFF  (Branco)
Marquee    →  #082C40  (Marinho Profundo)
Problema   →  #FFFFFF  (Branco)
Assessoria →  #082C40  (Marinho Profundo)
Como func. →  #F2F6FC  (Névoa Formulário)
Layla      →  #FFFFFF  (Branco)
Trajetória →  #FFFFFF  (Branco)
Depoimentos→  #F2F6FC  (Névoa Formulário)
Curso/Path →  #FFFFFF  → #082C40  (gradiente de virada)
FAQ        →  #F2F6FC  (Névoa Formulário)
Rodapé/CTA →  #082C40  (Marinho Profundo)
```

---

## Typography

### Escala de Tipos

**Display — Plus Jakarta Sans 800**
```
fontSize: clamp(44px, 6vw, 80px)
lineHeight: 0.98
letterSpacing: -0.035em
```
Usado no headline principal do hero. Tracking negativo agressivo cria densidade e autoridade. A tag `<span class="lp-serif">` injeta Instrument Serif italic em palavras-chave emocionais dentro do display.

**Headline — Plus Jakarta Sans 800**
```
fontSize: clamp(34px, 4.2vw, 56px)
lineHeight: 1.04
letterSpacing: -0.03em
```
Títulos de seção (H2). Mesma família, mesma densidade, escala responsiva via clamp.

**Serif Accent — Instrument Serif Italic 400**
```
fontSize: 1em (herda do pai)
fontWeight: 400
fontStyle: italic
```
Sempre dentro de `<span class="lp-serif">`. Nunca standalone como headline. Sua função é emocional: suavizar e humanizar uma palavra dentro de um bloco técnico (ex: "aprovação *de verdade*").

**Title — Plus Jakarta Sans 800**
```
fontSize: clamp(24px, 2.6vw, 32px)
lineHeight: 1.15
```
Títulos de cards, subtítulos de seção, números de estatísticas (40–64px, mesma família).

**Body — Inter 400**
```
fontSize: 17px
lineHeight: 1.75
color: #33475B (padrão) | #C4D4E6 (em fundos escuros)
```
Parágrafos de conteúdo. Inter garante legibilidade máxima em qualquer tamanho de tela.

**Label Uppercase — Inter 700**
```
fontSize: 13px
fontWeight: 700
letterSpacing: 0.08em
textTransform: uppercase
```
Marcadores de seção (ex: "COMO FUNCIONA", "DEPOIMENTOS"). Sempre em cor de acento (`#1663E0` em branco, `#8DB4F5` em marinho).

### Regras Tipográficas

> [!TIP]
> **Instrument Serif é tempero, não base.** Use com parcimônia — máximo 1–2 palavras por headline. Sua raridade preserva o impacto emocional.

> [!IMPORTANT]
> **Nunca use pesos abaixo de 400 em Plus Jakarta Sans.** O peso 800 é o tom padrão para títulos. O sistema não tem escala intermediária de peso entre headlines (800) e body (400) — a hierarquia é feita por tamanho e cor, não por peso.

---

## Layout

### Container e Grid

```
max-width: 1280px
padding-horizontal: 24px
margin: 0 auto
```

**Seções:**
- Padding vertical padrão: `120px 24px`
- Padding vertical grande: `128px 24px`
- Nunca menos que `80px` vertical em mobile

**Grids de Cards:**
```css
/* Padrão adaptativo */
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 24px;

/* Dois colunas fixo */
display: flex;
flex: 1 1 420px;  /* quebra em mobile automaticamente */
```

**Duas colunas hero (texto + imagem):**
```css
display: flex;
gap: clamp(40px, 6vw, 96px);
align-items: center;
/* Imagem: flex-shrink: 0, max-width ~44% */
```

### Breakpoints

| Token | Valor | Comportamento |
|-------|-------|---------------|
| `sm` | `640px` | `.lp-hide-sm` oculta, `.lp-full-sm` expande para 100% |
| `md` | `960px` | `.lp-hide-md` oculta elementos de suporte |

> [!NOTE]
> O sistema é mobile-first implícito via flexbox wrap e `minmax()`. Não há media queries explícitas para a maioria dos layouts — eles quebram organicamente.

### Estrutura de Seções

```
[Topbar]        altura: 44px, sticky não
[Nav]           altura: 72–80px, sem sticky (scroll livre)
[Hero]          min-height: 100vh, padding-top: 88px
[Marquee]       altura: 72px, overflow-hidden
[Seções]        padding: 120–128px 24px
[Rodapé]        padding: 80–100px 24px
[FAB WhatsApp]  position: fixed, bottom: 24px, right: 24px
```

---

## Elevation & Depth

A filosofia de profundidade é **atmosférica e emocional** — as sombras criam calor e presença, como luz natural incidindo em superfícies. Elas não são estruturais: um card com sombra não "manda" no layout, ele *respira*.

### Sombras Documentadas

| Nome | Valor CSS | Contexto |
|------|-----------|----------|
| `float-card` | `0 30px 60px -24px rgba(8,44,64,.45)` | Cards flutuantes sobre fotos da Layla |
| `hero-image` | `0 40px 80px -40px rgba(8,44,64,0.5)` | Foto principal no hero |
| `card-hover` | `0 28px 56px -28px rgba(8,44,64,.35)` | Estado hover dos testimonial cards |
| `button-blue-hover` | `0 16px 30px -14px rgba(22,99,224,.7)` | Botão primário azul em hover |
| `button-green-hover` | `0 16px 30px -14px rgba(22,127,67,.7)` | Botão verde em hover |
| `fab` | `0 16px 32px -12px rgba(0,0,0,.4)` | FAB WhatsApp fixo |

### Padrão das Sombras

Todas as sombras usam **spread negativo** (terceiro valor): `60px -24px`. Isso cria uma sombra que "afunda" para baixo e some nas bordas laterais — simulando luz vinda de cima, não difusa. O resultado é elegante e direcional.

A cor base de todas as sombras é `#082C40` (Marinho Profundo) com alpha variável. Nunca preto puro (`rgba(0,0,0,...)`) exceto no FAB.

### Layering Tonal (sem sombra)

Profundidade também é criada por alternância de fundo:
- Branco → Névoa Formulário → Marinho Profundo
- Nunca duas seções Marinho Profundo consecutivas (exceção: marquee + assessoria são adjacentes, mas o marquee serve como transição)

---

## Shapes

**Filosofia: Cápsulas de Confiança.** Formas generosas e arredondadas (pill), nunca angulosas. O arredondamento comunica acessibilidade, modernidade e acolhimento — adequado para um público que chega ansioso diante da burocracia.

### Escala de Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `pill` | `999px` | Todos os botões, chips, indicators, badges, círculo do FAB |
| `card-lg` | `28px` | Cards do hero, cards de caminho/path, cards de curso |
| `card-md` | `24px` | Feature cards, cards de assessoria, accordions FAQ |
| `card-sm` | `20px` | Overlays flutuantes internos, painéis aninhados |
| `card-xs` | `16px` | Thumbnails, elementos internos de cards |
| `testimonial` | `18px` | Fotos de depoimentos |
| `logo` | `12px` | Marca/logomark |

> [!IMPORTANT]
> **Nunca use `border-radius: 0`** em componentes interativos. O mínimo absoluto é `card-xs` (16px). Cantos retos são reservados para divisores horizontais (linhas, `<hr>`).

> [!TIP]
> **O pill é a assinatura.** Quando em dúvida entre `card-md` e `card-lg`, prefira `card-lg`. Este design nunca deve parecer app bancário genérico ou site de cursinho com bordas quadradas.

---

## Components

### Botão Primário (Azul)

```html
<a class="lp-btn lp-btn-primary" href="#">
  Conhecer a Assessoria
</a>
```

```css
.lp-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 22px;
  height: 46px;
  border-radius: 999px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
  text-decoration: none;
}
.lp-btn-primary {
  background-color: #1663E0;
  color: #FFFFFF;
  border: none;
}
.lp-btn-primary:hover {
  background-color: #0B4BB3;
  transform: translateY(-2px);
  box-shadow: 0 16px 30px -14px rgba(22,99,224,.7);
}
```

---

### Botão CTA Verde (WhatsApp)

```html
<a class="lp-btn lp-btn-green lp-btn-lg" href="https://wa.me/...">
  <svg><!-- ícone whatsapp --></svg>
  Falar no WhatsApp
</a>
```

```css
.lp-btn-green {
  background-color: #167F43;
  color: #FFFFFF;
  border: none;
  padding: 0 30px;
  height: 60px;
  font-size: 16px;
}
.lp-btn-green:hover {
  background-color: #0F6B37;
  transform: translateY(-2px);
  box-shadow: 0 16px 30px -14px rgba(22,127,67,.7);
}
```

> [!CAUTION]
> **Verde exclusivo para WhatsApp.** Nunca reutilize `#167F43` para outros CTAs. O usuário condiciona "verde = WhatsApp" neste design.

---

### Botão Ghost (Fundo Claro)

```html
<a class="lp-btn lp-btn-ghost" href="#">Ver detalhes</a>
```

```css
.lp-btn-ghost {
  background-color: transparent;
  color: #082C40;
  border: 1.5px solid #B9CDEB;
  height: 50px;
  padding: 0 22px;
}
.lp-btn-ghost:hover {
  background-color: #FFFFFF;
  border-color: #1663E0;
}
```

---

### Botão Ghost Dark (Fundo Marinho)

```css
.lp-btn-ghost-dark {
  background-color: transparent;
  color: #FFFFFF;
  border: 1.5px solid rgba(255,255,255,.3);
  height: 54px;
  padding: 0 24px;
}
.lp-btn-ghost-dark:hover {
  background-color: rgba(255,255,255,.08);
  border-color: rgba(255,255,255,.6);
}
```

---

### Float Card (Cards Flutuantes sobre Foto)

```html
<div class="lp-float-card">
  <div class="lp-float-icon"><!-- emoji ou svg --></div>
  <div>
    <strong>+2.000</strong>
    <span>alunos aprovados</span>
  </div>
</div>
```

```css
.lp-float-card {
  position: absolute;
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px 20px;
  box-shadow: 0 30px 60px -24px rgba(8,44,64,.45);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: lpFloat 6s ease-in-out infinite;
}
@keyframes lpFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
```

---

### Testimonial Card (`.lp-shot`)

```html
<div class="lp-shot">
  <img src="assets/images/depoimento-1.png" alt="Depoimento" />
</div>
```

```css
.lp-shot {
  background: #FFFFFF;
  border-radius: 18px;
  border: 1px solid #DCE6F4;
  overflow: hidden;
  transition: transform .35s ease, box-shadow .35s ease;
}
.lp-shot:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 28px 56px -28px rgba(8,44,64,.35);
}
```

---

### FAB WhatsApp (Fixed Action Button)

```html
<a class="lp-fab" href="https://wa.me/..." aria-label="Falar no WhatsApp">
  <svg><!-- ícone whatsapp 28px --></svg>
</a>
```

```css
.lp-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 62px;
  height: 62px;
  border-radius: 999px;
  background-color: #167F43;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 32px -12px rgba(0,0,0,.4);
  animation: lpPulse 2.4s ease-out infinite;
  z-index: 999;
}
@keyframes lpPulse {
  0%   { box-shadow: 0 0 0 0 rgba(22,127,67,.5); }
  70%  { box-shadow: 0 0 0 16px rgba(22,127,67,0); }
  100% { box-shadow: 0 0 0 0 rgba(22,127,67,0); }
}
```

---

### FAQ Accordion (`<details>`)

```html
<details class="lp-faq-item">
  <summary class="lp-faq-q">
    Quanto tempo leva o processo?
    <span class="lp-plus">+</span>
  </summary>
  <div class="lp-faq-a">
    <p>...</p>
  </div>
</details>
```

```css
.lp-faq-item {
  background: #FFFFFF;
  border-radius: 24px;
  border: 1px solid #DCE6F4;
  padding: 0 28px;
  overflow: hidden;
}
.lp-plus {
  display: inline-block;
  font-size: 24px;
  font-weight: 300;
  transition: transform .25s ease;
  flex-shrink: 0;
}
.lp-faq-item[open] .lp-plus {
  transform: rotate(45deg);
}
```

---

### Credibility Marquee Band

```html
<div class="lp-marquee-track">
  <div class="lp-marquee-inner">
    <!-- itens repetidos 2x para loop contínuo -->
  </div>
</div>
```

```css
.lp-marquee-track {
  background: #082C40;
  overflow: hidden;
  height: 72px;
}
.lp-marquee-inner {
  display: flex;
  gap: 56px;
  animation: lpMarquee 38s linear infinite;
  white-space: nowrap;
}
@keyframes lpMarquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

---

### Stat Block

```html
<div class="lp-stat">
  <span class="lp-stat-num">+2.000</span>
  <span class="lp-stat-label">alunos aprovados</span>
</div>
```

```css
.lp-stat-num {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 5vw, 64px);
  color: #082C40;
  letter-spacing: -0.03em;
  line-height: 1;
}
.lp-stat-label {
  font-size: 14px;
  color: #4A5A6B;
  font-weight: 500;
  margin-top: 6px;
}
```

---

## Motion & Animation

**Filosofia:** Movimento reforça clareza, nunca distrai. Cada animação tem uma única função semântica.

| Keyframe | Duração | Função | Timing |
|----------|---------|--------|--------|
| `lpUp` | 1s | Entrada de elementos (fade + subida) | `cubic-bezier(.2,.7,.2,1)` |
| `lpReveal` | 1.2s | Revelação do fundo da foto hero | `clip-path` sweep |
| `lpFloat` | 6–7s infinito | Bob vertical dos float cards | `ease-in-out` |
| `lpMarquee` | 38s infinito | Scroll horizontal da credibility band | `linear` |
| `lpPulse` | 2.4s infinito | Anel pulsante do FAB WhatsApp | `ease-out` |

**Transições de componente:**
```css
/* Botões */
transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;

/* Cards */
transition: transform .35s ease, box-shadow .35s ease;
```

> [!TIP]
> `lpFloat` usa `animation-delay` alternado por card (0s, 0.5s, 1s…) para criar assincronia natural. Nunca sincronize todos os float cards — parece robótico.

---

## Do's and Don'ts

### ✅ Faça

- **Use pill (`999px`) em todos os botões e badges** — é a assinatura do sistema
- **Reserve verde (`#167F43`) exclusivamente para WhatsApp** — FAB, botões "Falar no WhatsApp", e nada mais
- **Alterne seções** entre Branco → Névoa Formulário → Marinho Profundo para criar ritmo sem entorpecer
- **Injete Instrument Serif italic** (`<span class="lp-serif">`) para humanizar 1–2 palavras em headlines importantes
- **Use tracking negativo** (`-0.03em` a `-0.035em`) em todos os títulos Plus Jakarta Sans 800
- **Use spread negativo nas sombras** para efeito de luz direcional (ex: `60px -24px`)
- **Repita itens da credibility marquee 2×** no HTML para loop contínuo sem JS
- **Inclua o disclaimer ético** ("a instituição decide a aprovação") em qualquer CTA que prometa resultado

### ❌ Não Faça

- **Nunca use cantos retos** (`border-radius: 0`) em componentes interativos
- **Nunca use `#167F43` para elementos não-WhatsApp** — ícones, fundos, decoração, destaques de texto
- **Nunca use Instrument Serif como headline standalone** — sempre dentro de Plus Jakarta Sans, como palavra dentro da frase
- **Nunca coloque números de WhatsApp no HTML** — apenas via rotador JS (`main.js`)
- **Nunca use pesos abaixo de 400** (nunca 300, nunca 100) — o design não tem escala light
- **Nunca faça duas seções Marinho Profundo consecutivas sem transição** — quebre com Branco ou Névoa
- **Nunca sincronize os float cards** no mesmo timing de animação
- **Nunca remova o ponto verde indicador** (`#3DDC84`) da topbar — é o indicador de "sistema ativo"
- **Nunca pareça app bancário genérico ou site de cursinho** — sem tabelas de preço em grade agressiva, sem countdown timers, sem pop-ups de urgência falsa

## Painel de instrumentos (kit de peças)

Conceito aplicado à página toda: cada seção lê o estado da documentação do aluno com um instrumento, todos do mesmo kit (`assets/css/site.css` (camada instrumentos)).

| Seção | Instrumento | Classe |
|---|---|---|
| Hero | Mostrador de três leituras (grupo familiar, renda, envio) | `.ins-mostrador` |
| Dúvidas do aluno | Luzes de alerta | `.ins-alerts` |
| O que a assessoria cobre | Checklist com ✓ traçado | `.ins-checklist` |
| Como funciona | Trilha de três passos | `.lp-steps` |
| Aprovações | Registro de notas, com contagem animada | `.ins-ledger` |
| Planos | Visor de preço (sem animação) | `.ins-visor` |
| Dúvidas | Diário: luz acende ao abrir | `.lp-faq-question::before` |
| Rodapé | Terminal de contato | `.lp-footer-grid` |

**Regras:** só dados reais; luzes em azul-elétrico (o verde segue reservado ao WhatsApp); números em algarismos tabulares; animação uma vez ao entrar na tela (`[data-ins]` recebe `.is-on` via `main.js`); estado final é o padrão, e os estados iniciais só existem com `.js` e sem `prefers-reduced-motion`; o preço nunca anima.

**Vocabulário das luzes:** luz cheia (azul-elétrico) = coberto ou ativo (mostrador do hero, item de FAQ aberto); anel com "?" = dúvida do aluno. O significado vem da forma, nunca de uma cor nova.

## Revisão tipográfica (typeset)

Famílias inalteradas: Inter (corpo), Plus Jakarta Sans (títulos e números), Instrument Serif itálico (acento). Camada de tipografia em `assets/css/site.css`.

| Papel | Valor | Observação |
|---|---|---|
| Display (h1) | clamp(44px, 6vw, 80px) / 1.0 / -0.035em | Mantido; `text-wrap: balance` |
| Headline (h2) | clamp(34px, 4.2vw, 56px) / 1.06 / -0.03em | Variante `lp-h2-md` (30–44px, -0.025em) |
| Título de item (h3/h4) | 22–24px / 1.2 / -0.012em, peso 700 | h4 agora em Plus Jakarta (antes Inter) |
| Lead (`t-lead`) | 17–19px / 1.65 / medida 50ch | Parágrafo de abertura de seção |
| Corpo (`t-body`) | 17px / 1.7 / 54ch | Texto corrido |
| Corpo pequeno (`t-sm`) | 16px / 1.65 / 54ch | Cards, respostas, listas |
| Meta (`t-meta`) | 15px / 1.55 / 58ch | Notas e avisos; piso de 14px |

**Regras:** títulos com `text-wrap: balance`, texto com `pretty`; sobre fundo escuro, +0.006em de espaçamento e entrelinha de 1.7; números tabulares em tabelas, notas e preços; fontes locais com `preload`.

## Movimento

Tese: o painel "acende". Arquivo `assets/css/site.css` (camada movimento) (CSS) e `initScrollEffects` em `main.js`.

- **Entrada:** títulos de seção, vídeo, galeria (atraso total ≤ 240ms), cartões de plano e a Layla sobem 14px e aparecem em 700ms; a palavra em serifa do título ganha cor 300ms depois. Atributo `data-reveal`.
- **Feedback:** botões levantam no hover e afundam no clique (`:active`, 80ms); o ícone acompanha (WhatsApp gira, setas deslizam). Cabeçalho ganha sombra ao rolar e marca a seção atual com sublinhado.
- **Estado:** checklist com "pop" na caixa e "tique" no contador; abrir blocos com altura suave onde o navegador suporta.
- **Laços:** o botão flutuante pulsa 3 vezes e descansa; flutuação do hero e faixa de credenciais pausam fora da tela.
- **Movimento reduzido:** sem deslocamento, laços ou lift; entradas viram fade de opacidade e luzes mudam só de cor. O estado nunca é removido.
- **Segurança:** se o JS não iniciar em 3s, a classe `js` é retirada e tudo aparece no estado final.

## Detalhes (delight)

Tese: quem chega sente que alguém organizou o caminho por ele, com precisão e sem ruído. Cinco gestos, nenhum decorativo.

- **Barra de leitura:** fio de 2px no pé do cabeçalho, no azul das luzes, que mede quanto da página já foi percorrido.
- **Checklist completo:** ao marcar o 9º item, as 9 barras clareiam em sequência (40ms entre elas), a borda do painel acende e surge o CTA "Falar com um consultor" com a mensagem "Tudo separado".
- **Volta do aluno:** se há marcações guardadas, o painel avisa "Bem-vindo de volta: N de 9 itens já separados".
- **Chegada por âncora:** ao ir para uma seção pelo menu, a palavra em serifa do título é sublinhada uma vez e some.
- **Clique no WhatsApp:** o botão confirma "Abrindo o WhatsApp…" por 2s, sem mudar de largura.

Sem som, sem confete, sem mascote. Movimento reduzido: o sublinhado de chegada não roda; barras e CTA mudam só de estado.

## Momento do hero (overdrive): arco graduado

O arco azul do hero é o bisel de um instrumento. Uma escala de 25 marcas (7,5° cada, 5 principais) em SVG inline, `.ins-bezel` em `site.css`, contorna o arco e se posiciona com unidades de contêiner (`cqw`), então acompanha qualquer largura.

- **Sequência (uma vez, ~2,4s):** o arco sobe, as marcas se traçam da esquerda para a direita (24ms entre elas) e os três trechos mudam de cor junto com as luzes do mostrador: Grupo familiar, Renda e Envio (260ms entre trechos).
- **Custo:** 25 `<line>` (~2 KB), só `stroke` e `stroke-dashoffset`, sem JS próprio (usa o `data-ins` existente), sem GPU extra. Sem laço.
- **Movimento reduzido ou sem JS:** a escala aparece pronta e acesa. Sem suporte a `cqw`, o bisel é ocultado e o hero fica como antes.

## Fundo do Hero (Rain Glass Background)

O Hero recebe, atrás de todo o conteúdo, o componente original **Rain Glass Background** (Kokonut UI, instalado com `npx shadcn@latest add @kokonutui/rain-glass-background`), em `src/components/kokonutui/`, sem alterações. Nenhuma outra seção usa o efeito.

- **Camada atrás do conteúdo:** `aria-hidden`; título e filhos do componente ficam vazios. O vidro é **interativo** (arrastar limpa o embaçado): o conteúdo do Hero usa `pointer-events: none` e só links e botões ficam clicáveis (regra no fim de `styles/site.css`). Efeito colateral: o texto do Hero não pode ser selecionado com o mouse.
- **Véu de legibilidade:** gradiente branco (65% → 0%) da esquerda para a direita, só sobre a coluna de texto; no mobile, branco a 45%. É uma camada própria, fora do componente.
- **Desempenho:** WebGL2, resolução limitada a 1,5×, no máximo 140 gotas; o laço pausa fora da tela e com a aba oculta.
- **Movimento reduzido:** o componente não inicia o laço e desenha quadros estáticos.
- **Fallback:** sem WebGL2 ou sem a imagem, o fundo fica cinza claro (`zinc-200`) e o conteúdo continua legível.
