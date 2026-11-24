# KŌBO® — Loja de roupas fictícia

Home de e-commerce de uma marca fictícia de streetwear (São Paulo), feita a partir do handoff de design `design_handoff_kobo_loja`. É HTML, CSS e JavaScript puro, sem build e sem dependências.

**Site no ar:** https://myoshida-dev.github.io/loja-kobo/

## Como abrir

Dê dois cliques em `index.html` para abrir no navegador. As fontes (Space Grotesk e JetBrains Mono) vêm do Google Fonts, então é preciso estar com internet. Sem conexão, a página usa fontes do sistema.

Para publicar, envie a pasta inteira para qualquer hospedagem estática (GitHub Pages, Netlify, Vercel).

## Estrutura

```
index.html        Estrutura da página (8 seções do handoff + sacola)
css/styles.css    Tokens de design, layout e regras responsivas
js/products.js    Catálogo fictício ("Mais vendidos")
js/main.js        Grade de produtos, sacola, menu mobile e newsletter
assets/favicon.svg
```

## O que funciona

- **Sacola**: "+ ADICIONAR" soma ao contador `SACOLA [n]`. Clicar em SACOLA abre um drawer lateral com quantidade, remoção, subtotal, parcelamento em até 6x e uma barra de progresso até o frete grátis (R$ 399). A sacola fica salva no `localStorage`.
- **Esgotado**: produtos com `soldOut: true` têm o botão desabilitado.
- **Checkout**: não existe. O botão "FINALIZAR COMPRA" só avisa que a loja é fictícia.
- **Newsletter**: valida o e-mail e mostra uma confirmação. Nada é enviado.
- **Responsivo** (não estava desenhado no handoff):
  - Abaixo de 1260px a navegação vira um botão MENU.
  - Abaixo de 1100px o hero empilha.
  - Abaixo de 960px a grade passa a ter 2 colunas.
  - Abaixo de 720px a barra de aviso vira letreiro.
- **Acessibilidade**:
  - Link "Pular para o conteúdo" e foco visível.
  - A sacola é um `<dialog>`: Esc e clique fora fecham.
  - Avisos para leitores de tela.
  - O letreiro respeita `prefers-reduced-motion`.

## Onde mexer

- **Produtos**: edite `js/products.js`. Cada item tem `name`, `price`, `tag` (opcional), `img` (texto do placeholder) e `soldOut` (opcional).
- **Flags**: no topo de `js/main.js` (`CONFIG`) ficam `showAnnouncement`, `showInstallments`, o número de parcelas, o valor do frete grátis e o limite por produto.
- **Cores e fontes**: nas variáveis em `:root`, no início de `css/styles.css`.
- **Fotos**: as imagens ainda são placeholders listrados com o aviso "EM BREVE". A descrição de cada foto de produto continua no campo `img` de `js/products.js`. Para usar fotos reais, troque o fundo `.placeholder` por `<img>` (ou `background-image`) no hero, nos cards e no bloco institucional.
