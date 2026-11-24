(function () {
  'use strict';

  /* ---------- Configuração (flags do handoff) ---------- */
  var CONFIG = {
    showAnnouncement: true,   // barra lime do topo
    showInstallments: true,   // "3x de R$ ... sem juros" nos cards
    cardInstallments: 3,      // parcelas mostradas nos cards
    cartInstallments: 6,      // "até 6x sem juros" na sacola
    freeShippingFrom: 399,    // frete grátis a partir de (R$)
    maxQtyPerItem: 10,
    storageKey: 'kobo:cart'
  };

  var PRODUCTS = window.KOBO_PRODUCTS || [];
  var productsById = new Map(PRODUCTS.map(function (p) { return [p.id, p]; }));

  /* ---------- Utilidades ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function money(value) {
    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function installment(value, times) {
    return money(Math.round(value / times * 100) / 100);
  }

  var liveRegion = $('#live-region');
  function announce(message) {
    // Limpa antes para leitores de tela repetirem mensagens iguais
    liveRegion.textContent = '';
    window.setTimeout(function () { liveRegion.textContent = message; }, 50);
  }

  /* ---------- Estado da sacola ---------- */
  var cart = loadCart();

  function loadCart() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(CONFIG.storageKey));
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(function (item) {
          var product = item && productsById.get(item.id);
          return product && !product.soldOut;
        })
        .map(function (item) {
          var qty = Math.floor(Number(item.qty)) || 1;
          return { id: item.id, qty: Math.min(Math.max(qty, 1), CONFIG.maxQtyPerItem) };
        });
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    try { window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart)); } catch (e) { /* modo privado etc. */ }
  }

  function cartCount() {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }
  function cartSubtotal() {
    return cart.reduce(function (sum, item) { return sum + productsById.get(item.id).price * item.qty; }, 0);
  }
  function findItem(id) {
    return cart.find(function (item) { return item.id === id; });
  }

  function addToCart(id) {
    var product = productsById.get(id);
    if (!product || product.soldOut) return false;
    var item = findItem(id);
    if (item) {
      if (item.qty >= CONFIG.maxQtyPerItem) return false;
      item.qty += 1;
    } else {
      cart.push({ id: id, qty: 1 });
    }
    commit();
    return true;
  }

  function setQty(id, qty) {
    var item = findItem(id);
    if (!item) return;
    item.qty = Math.min(Math.max(qty, 1), CONFIG.maxQtyPerItem);
    commit();
  }

  function removeFromCart(id) {
    cart = cart.filter(function (item) { return item.id !== id; });
    commit();
  }

  function commit() {
    saveCart();
    renderCart();
  }

  /* ---------- Barra de aviso ---------- */
  if (!CONFIG.showAnnouncement) {
    var bar = $('#announce');
    if (bar) bar.remove();
  }

  /* ---------- Grade de produtos ---------- */
  var grid = $('#product-grid');
  var productTpl = $('#tpl-product');

  function renderProducts() {
    var frag = document.createDocumentFragment();

    PRODUCTS.forEach(function (p) {
      var node = productTpl.content.firstElementChild.cloneNode(true);
      var slot = function (name) { return $('[data-slot="' + name + '"]', node); };

      slot('name').textContent = p.name;
      slot('price').textContent = money(p.price);

      if (p.tag) slot('tag').textContent = p.tag;
      else slot('tag').remove();

      if (CONFIG.showInstallments) {
        slot('inst').textContent = CONFIG.cardInstallments + 'x de ' + installment(p.price, CONFIG.cardInstallments) + ' sem juros';
      } else {
        slot('inst').remove();
      }

      var btn = slot('add');
      btn.dataset.id = p.id;
      if (p.soldOut) {
        btn.disabled = true;
        btn.setAttribute('aria-label', p.name + ' — esgotado');
      } else {
        btn.setAttribute('aria-label', 'Adicionar ' + p.name + ' à sacola');
      }

      frag.appendChild(node);
    });

    grid.appendChild(frag);
  }

  grid.addEventListener('click', function (event) {
    var btn = event.target.closest('.btn-add');
    if (!btn || btn.disabled) return;

    var product = productsById.get(btn.dataset.id);
    if (!addToCart(product.id)) {
      announce('Limite de ' + CONFIG.maxQtyPerItem + ' unidades por produto.');
      return;
    }

    var total = cartCount();
    announce('Adicionado à sacola: ' + product.name + '. ' + total + (total === 1 ? ' item' : ' itens') + ' na sacola.');
    bumpCount();

    btn.classList.add('is-added');
    btn.textContent = '✓ ADICIONADO';
    window.clearTimeout(btn._resetTimer);
    btn._resetTimer = window.setTimeout(function () {
      btn.classList.remove('is-added');
      btn.textContent = '+ ADICIONAR';
    }, 1200);
  });

  function bumpCount() {
    var headerCount = $('.cart-count');
    headerCount.classList.add('is-bumped');
    window.clearTimeout(headerCount._bumpTimer);
    headerCount._bumpTimer = window.setTimeout(function () {
      headerCount.classList.remove('is-bumped');
    }, 700);
  }

  /* ---------- Sacola (drawer) ---------- */
  var dialog = $('#cart');
  var itemsList = $('#cart-items');
  var itemTpl = $('#tpl-cart-item');
  var emptyState = $('#cart-empty');
  var foot = $('#cart-foot');
  var shipText = $('#cart-ship-text');
  var barFill = $('#cart-bar-fill');
  var subtotalEl = $('#cart-subtotal');
  var instEl = $('#cart-inst');
  var noteEl = $('#cart-note');

  function renderCart() {
    var count = cartCount();
    var subtotal = cartSubtotal();

    $all('[data-cart-count]').forEach(function (el) { el.textContent = count; });
    $('.cart-toggle').setAttribute('aria-label', 'Abrir sacola, ' + count + (count === 1 ? ' item' : ' itens'));

    // Frete grátis
    var remaining = CONFIG.freeShippingFrom - subtotal;
    shipText.classList.toggle('is-done', subtotal > 0 && remaining <= 0);
    if (subtotal === 0) {
      shipText.textContent = 'FRETE GRÁTIS ACIMA DE R$ ' + CONFIG.freeShippingFrom;
    } else if (remaining > 0) {
      shipText.textContent = '';
      shipText.append('FALTAM ');
      var strong = document.createElement('strong');
      strong.textContent = money(remaining);
      shipText.append(strong, ' PARA O FRETE GRÁTIS');
    } else {
      shipText.textContent = 'FRETE GRÁTIS DESBLOQUEADO';
    }
    barFill.style.width = Math.min(subtotal / CONFIG.freeShippingFrom, 1) * 100 + '%';

    // Itens
    var frag = document.createDocumentFragment();
    cart.forEach(function (item) {
      var p = productsById.get(item.id);
      var node = itemTpl.content.firstElementChild.cloneNode(true);
      var slot = function (name) { return $('[data-slot="' + name + '"]', node); };

      node.dataset.id = p.id;
      slot('name').textContent = p.name;
      slot('unit').textContent = money(p.price);
      slot('qty').textContent = item.qty;
      slot('total').textContent = money(p.price * item.qty);
      slot('qty-group').setAttribute('aria-label', 'Quantidade de ' + p.name);

      var dec = $('[data-act="dec"]', node);
      var inc = $('[data-act="inc"]', node);
      dec.disabled = item.qty <= 1;
      inc.disabled = item.qty >= CONFIG.maxQtyPerItem;
      dec.setAttribute('aria-label', 'Diminuir quantidade de ' + p.name);
      inc.setAttribute('aria-label', 'Aumentar quantidade de ' + p.name);
      $('[data-act="remove"]', node).setAttribute('aria-label', 'Remover ' + p.name + ' da sacola');

      frag.appendChild(node);
    });
    itemsList.replaceChildren(frag);

    var isEmpty = cart.length === 0;
    itemsList.hidden = isEmpty;
    emptyState.hidden = !isEmpty;
    foot.hidden = isEmpty;

    subtotalEl.textContent = money(subtotal);
    instEl.textContent = 'em até ' + CONFIG.cartInstallments + 'x de ' + installment(subtotal, CONFIG.cartInstallments) + ' sem juros';
    noteEl.textContent = '';
  }

  itemsList.addEventListener('click', function (event) {
    var btn = event.target.closest('button[data-act]');
    if (!btn || btn.disabled) return;
    var row = btn.closest('.cart-item');
    var id = row.dataset.id;
    var item = findItem(id);
    var product = productsById.get(id);
    var act = btn.dataset.act;

    if (act === 'inc') setQty(id, item.qty + 1);
    if (act === 'dec') setQty(id, item.qty - 1);
    if (act === 'remove') {
      removeFromCart(id);
      announce('Removido da sacola: ' + product.name + '.');
      // Mantém o foco dentro da sacola
      var next = $('.cart-item [data-act="remove"]', itemsList) || $('.cart__close');
      next.focus();
      return;
    }

    // Re-renderizar recria os botões: devolve o foco ao mesmo controle
    var again = $('.cart-item[data-id="' + id + '"] [data-act="' + act + '"]', itemsList);
    if (again && !again.disabled) again.focus();
    else if (again) $('.cart-item[data-id="' + id + '"] .qty__btn:not(:disabled)', itemsList).focus();
  });

  $('#cart-checkout').addEventListener('click', function () {
    noteEl.textContent = 'Loja fictícia — o checkout não está ativo.';
  });

  var lastTrigger = null;

  function openCart() {
    if (dialog.open) return;
    lastTrigger = document.activeElement;
    closeMenu();
    renderCart();
    dialog.classList.remove('is-closing');
    dialog.showModal();
    document.documentElement.classList.add('is-locked');
    $('.cart__close').focus();
  }

  function closeCart(afterClose) {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      dialog.classList.remove('is-closing');
      dialog.close();
      document.documentElement.classList.remove('is-locked');
      if (typeof afterClose === 'function') afterClose();
      else if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    }
    dialog.classList.add('is-closing');
    dialog.addEventListener('animationend', finish, { once: true });
    window.setTimeout(finish, 300); // garantia caso a animação não dispare
  }

  $('.cart-toggle').addEventListener('click', openCart);

  dialog.addEventListener('cancel', function (event) {
    event.preventDefault(); // Esc: fecha com animação
    closeCart();
  });

  dialog.addEventListener('click', function (event) {
    // Clique no fundo escuro (fora do painel)
    if (event.target === dialog) { closeCart(); return; }

    var closer = event.target.closest('[data-cart-close]');
    if (!closer) return;
    event.preventDefault();
    var href = closer.getAttribute('href');
    closeCart(href ? function () {
      var target = $(href);
      if (target) {
        target.scrollIntoView();
        var firstBtn = $('.btn-add:not(:disabled)', target);
        if (firstBtn) firstBtn.focus({ preventScroll: true });
      }
    } : undefined);
  });

  /* ---------- Menu mobile ---------- */
  var menuToggle = $('.menu-toggle');
  var mobileMenu = $('#mobile-menu');
  var menuLabel = $('.menu-toggle__label');

  function setMenu(open) {
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'FECHAR' : 'MENU';
  }
  function closeMenu() {
    if (!mobileMenu.hidden) setMenu(false);
  }

  menuToggle.addEventListener('click', function () {
    setMenu(mobileMenu.hidden);
  });
  mobileMenu.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !mobileMenu.hidden) {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.matchMedia('(min-width: 1261px)').addEventListener('change', function (mq) {
    if (mq.matches) closeMenu();
  });

  /* ---------- Newsletter ---------- */
  var form = $('#newsletter-form');
  var emailInput = $('#newsletter-email');
  var formMsg = $('#newsletter-msg');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var email = emailInput.value.trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    if (!valid) {
      emailInput.setAttribute('aria-invalid', 'true');
      formMsg.textContent = email ? 'Confira o e-mail digitado.' : 'Digite seu e-mail para entrar na lista.';
      emailInput.focus();
      return;
    }

    emailInput.removeAttribute('aria-invalid');
    formMsg.textContent = 'Pronto! Você vai saber dos próximos drops antes de todo mundo.';
    form.reset();
  });
  emailInput.addEventListener('input', function () {
    if (emailInput.hasAttribute('aria-invalid')) {
      emailInput.removeAttribute('aria-invalid');
      formMsg.textContent = '';
    }
  });

  /* ---------- Início ---------- */
  renderProducts();
  renderCart();
})();
