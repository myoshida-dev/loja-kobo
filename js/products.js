/*
 * Catálogo fictício da KŌBO® (seção "Mais vendidos").
 * Em produção esta lista viria do backend/CMS.
 *
 * price   → valor em reais (número)
 * tag     → selo opcional no canto da foto ("NOVO", "ESGOTADO"...)
 * soldOut → true desabilita o botão de adicionar
 * img     → descrição da foto que vai entrar (hoje o card mostra "EM BREVE")
 */
window.KOBO_PRODUCTS = [
  { id: 'camiseta-boxy-grade-preta',        name: 'Camiseta Boxy Malha 30.1 "Grade" Preta',    price: 189.90, tag: 'NOVO',     img: 'camiseta boxy preta' },
  { id: 'calca-baggy-cargo-concreto',       name: 'Calça Baggy Sarja Cargo "Concreto" Grafite', price: 349.90,                  img: 'calça cargo grafite' },
  { id: 'jaqueta-ripstop-viaduto-oliva',    name: 'Jaqueta Ripstop Técnica "Viaduto" Oliva',    price: 529.90, tag: 'NOVO',     img: 'jaqueta ripstop oliva' },
  { id: 'camiseta-oversized-obra-offwhite', name: 'Camiseta Oversized "Obra" Off-White',        price: 179.90,                  img: 'camiseta oversized off-white' },
  { id: 'bermuda-worker-bege',              name: 'Bermuda Worker Sarja Bege',                  price: 249.90,                  img: 'bermuda worker bege' },
  { id: 'moletom-boxy-turno-preto',         name: 'Moletom Boxy Felpado "Turno" Preto',         price: 389.90, tag: 'ESGOTADO', img: 'moletom boxy preto', soldOut: true },
  { id: 'calca-alfaiataria-wide-cinza',     name: 'Calça Alfaiataria Pregas Wide Cinza',        price: 399.90,                  img: 'calça alfaiataria cinza' },
  { id: 'corrente-aco-fiacao',              name: 'Corrente Elos Aço Inox "Fiação"',            price: 159.90,                  img: 'corrente aço inox' }
];
