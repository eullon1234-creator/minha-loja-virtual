class Carrinho {
  static renderizar() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');
    const emptyEl = document.getElementById('cartEmpty');
    if (!container) return;

    const itens = LojaDB.getCarrinho();

    if (itens.length === 0) {
      container.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      if (summary) summary.style.display = 'none';
      Header.atualizarBadge();
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (summary) summary.style.display = 'block';

    container.innerHTML = itens.map((item, idx) => {
      const subtotal = item.preco * item.quantidade;
      return `
        <div class="cart-item animate-in" data-index="${idx}">
          <div class="cart-item-img">
            <img src="${item.imagem}" alt="${item.nome}" loading="lazy"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22130%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22130%22/><text fill=%22%23999%22 font-size=%2212%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22>Sem Imagem</text></svg>'">
          </div>
          <div class="cart-item-info">
            <h3>${item.nome}</h3>
            <div class="variant">
              ${item.tamanho ? `Tamanho: ${item.tamanho}` : ''}
              ${item.cor ? ` | Cor: ${item.cor}` : ''}
            </div>
            <div class="price">${LojaDB.formatarPreco(item.preco)}</div>
          </div>
          <div class="cart-item-controls">
            <div class="qty-controls">
              <button onclick="Carrinho.alterarQtd(${idx}, -1)">−</button>
              <input type="text" value="${item.quantidade}" readonly>
              <button onclick="Carrinho.alterarQtd(${idx}, 1)">+</button>
            </div>
            <div class="cart-item-total">${LojaDB.formatarPreco(subtotal)}</div>
            <button class="cart-item-remove" onclick="Carrinho.remover(${idx})" title="Remover">✕</button>
          </div>
        </div>
      `;
    }).join('');

    Carrinho.atualizarResumo();
    Header.atualizarBadge();
  }

  static alterarQtd(index, delta) {
    const itens = LojaDB.getCarrinho();
    if (!itens[index]) return;
    const novaQtd = itens[index].quantidade + delta;
    LojaDB.atualizarQuantidade(index, novaQtd);
    Carrinho.renderizar();
  }

  static remover(index) {
    LojaDB.removerDoCarrinho(index);
    Carrinho.renderizar();
    Toast.mostrar('Item removido do carrinho', '');
  }

  static atualizarResumo() {
    const itens = LojaDB.getCarrinho();
    const subtotal = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const frete = 12.90;
    const total = subtotal + frete;

    const elSubtotal = document.getElementById('cartSubtotal');
    const elFrete = document.getElementById('cartFrete');
    const elTotal = document.getElementById('cartTotal');

    if (elSubtotal) elSubtotal.textContent = LojaDB.formatarPreco(subtotal);
    if (elFrete) elFrete.textContent = LojaDB.formatarPreco(frete);
    if (elTotal) elTotal.textContent = LojaDB.formatarPreco(total);

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.href = itens.length > 0 ? 'checkout.html' : '#';
    }
  }

  static irCheckout() {
    const itens = LojaDB.getCarrinho();
    if (itens.length === 0) {
      Toast.mostrar('Carrinho vazio! Adicione produtos primeiro.', 'error');
      return;
    }
    window.location.href = 'checkout.html';
  }

  static renderizarCheckoutResumo() {
    const container = document.getElementById('checkoutResumo');
    if (!container) return;

    const itens = LojaDB.getCarrinho();
    if (itens.length === 0) {
      window.location.href = 'carrinho.html';
      return;
    }

    container.innerHTML = itens.map(item => `
      <div class="order-item">
        <div class="order-item-img">
          <img src="${item.imagem}" alt="${item.nome}" loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2265%22><rect fill=%22%23f0f0f0%22 width=%2250%22 height=%2265%22/></svg>'">
        </div>
        <div class="order-item-info">
          <h4>${item.nome}</h4>
          <div class="qty">
            Qtd: ${item.quantidade} | ${item.tamanho ? item.tamanho : ''} ${item.cor ? '- ' + item.cor : ''}
          </div>
        </div>
        <div class="order-item-price">${LojaDB.formatarPreco(item.preco * item.quantidade)}</div>
      </div>
    `).join('');

    Carrinho.atualizarCheckoutTotal();
  }

  static atualizarCheckoutTotal() {
    const itens = LojaDB.getCarrinho();
    const subtotal = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const frete = 12.90;
    const total = subtotal + frete;

    const elSubtotal = document.getElementById('checkoutSubtotal');
    const elFrete = document.getElementById('checkoutFrete');
    const elTotal = document.getElementById('checkoutTotal');

    if (elSubtotal) elSubtotal.textContent = LojaDB.formatarPreco(subtotal);
    if (elFrete) elFrete.textContent = LojaDB.formatarPreco(frete);
    if (elTotal) elTotal.textContent = LojaDB.formatarPreco(total);
  }

  static finalizarPedido(event) {
    event.preventDefault();
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());

    if (!dados.nome || !dados.email || !dados.telefone || !dados.endereco || !dados.cidade || !dados.uf || !dados.cep) {
      Toast.mostrar('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const itens = LojaDB.getCarrinho();
    if (itens.length === 0) {
      Toast.mostrar('Carrinho vazio!', 'error');
      return;
    }

    const pagamento = document.querySelector('input[name="pagamento"]:checked');
    if (!pagamento) {
      Toast.mostrar('Selecione uma forma de pagamento', 'error');
      return;
    }

    const pedido = {
      cliente: dados,
      pagamento: pagamento.value,
      itens: [...itens],
      subtotal: itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0),
      frete: 12.90,
      total: itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0) + 12.90
    };

    LojaDB.salvarPedido(pedido);
    LojaDB.limparCarrinho();
    Header.atualizarBadge();

    localStorage.setItem('loja_ultimo_pedido', JSON.stringify(pedido));
    window.location.href = 'checkout.html?success=true';
  }

  static exibirSucesso() {
    const pedido = JSON.parse(localStorage.getItem('loja_ultimo_pedido'));
    if (!pedido) return;

    const container = document.getElementById('checkoutContent');
    if (!container) return;

    container.innerHTML = `
      <div class="success-page">
        <div>
          <div class="icon">✓</div>
          <h1>Pedido Confirmado!</h1>
          <p>Seu pedido #${pedido.id} foi registrado com sucesso.</p>
          <p style="margin-bottom:30px">Você receberá um e-mail com os detalhes da compra.</p>
          <a href="index.html" class="btn btn-primary">Voltar às Compras</a>
        </div>
      </div>
    `;
  }
}
