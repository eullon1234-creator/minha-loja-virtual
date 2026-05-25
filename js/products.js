class Produtos {
  static criarCard(produto) {
    const isFav = LojaDB.isFavorito(produto.id);
    const badges = [];
    if (produto.destaque) badges.push('<span class="product-badge destaque">Destaque</span>');
    if (produto.novidade) badges.push('<span class="product-badge novidade">Novidade</span>');
    if (produto.maisVendido) badges.push('<span class="product-badge vendido">Mais Vendido</span>');

    const estoqueClass = produto.estoque > 20 ? 'alto' : produto.estoque > 5 ? 'medio' : 'baixo';

    return `
      <div class="product-card animate-in" data-id="${produto.id}">
        <div class="product-card-img" onclick="Produtos.irParaProduto(${produto.id})">
          <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22><rect fill=%22%23f0f0f0%22 width=%22300%22 height=%22400%22/><text fill=%22%23999%22 font-size=%2220%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22>Sem Imagem</text></svg>'">
          <div class="product-badges">${badges.join('')}</div>
          <div class="product-card-actions">
            <button class="product-action-btn ${isFav ? 'favorito' : ''}" onclick="event.stopPropagation(); Produtos.toggleFavorito(${produto.id})" title="Favoritar">
              ${isFav ? '♥' : '♡'}
            </button>
            <button class="product-action-btn" onclick="event.stopPropagation(); Produtos.compartilhar(${produto.id})" title="Compartilhar">
              ↗
            </button>
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-category">${produto.categoria}</div>
          <h3 class="product-name" onclick="Produtos.irParaProduto(${produto.id})">${produto.nome}</h3>
          <div class="product-rating">
            ${'★'.repeat(4)}☆ <span>(42)</span>
          </div>
          <div class="product-price-row">
            <div>
              <div class="product-price">
                ${LojaDB.formatarPreco(produto.preco)}
              </div>
              <div class="product-installments">ou 3x de ${LojaDB.formatarPreco(produto.preco / 3)} s/juros</div>
            </div>
            <button class="add-cart-btn" onclick="event.stopPropagation(); Produtos.addToCart(${produto.id})" title="Adicionar ao carrinho">
              +
            </button>
          </div>
          <div style="margin-top:8px">
            <span class="stock-badge ${estoqueClass}">${produto.estoque} em estoque</span>
          </div>
        </div>
      </div>
    `;
  }

  static irParaProduto(id) {
    window.location.href = `produto.html?id=${id}`;
  }

  static toggleFavorito(id) {
    const isFav = LojaDB.toggleFavorito(id);
    const cards = document.querySelectorAll(`.product-card[data-id="${id}"]`);
    cards.forEach(card => {
      const btn = card.querySelector('.product-action-btn:first-child');
      if (btn) {
        btn.innerHTML = isFav ? '♥' : '♡';
        btn.classList.toggle('favorito', isFav);
      }
    });
    const msg = isFav ? 'adicionado aos' : 'removido dos';
    Toast.mostrar(`Produto ${msg} favoritos`, isFav ? 'success' : '');
  }

  static compartilhar(id) {
    const url = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}produto.html?id=${id}`;
    if (navigator.share) {
      navigator.share({ title: 'Confira este produto!', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        Toast.mostrar('Link copiado para compartilhar!', 'success');
      });
    }
  }

  static async addToCart(id, tamanho, cor, quantidade) {
    const produto = LojaDB.getProduto(id);
    if (!produto) return Toast.mostrar('Produto não encontrado', 'error');

    const tamanhoFinal = tamanho || (produto.tamanhos.length === 1 ? produto.tamanhos[0] : null);
    const corFinal = cor || (produto.cores.length === 1 ? produto.cores[0] : null);

    if (!tamanhoFinal) {
      window.location.href = `produto.html?id=${id}`;
      return;
    }

    const qtd = quantidade || 1;

    LojaDB.adicionarAoCarrinho({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      tamanho: tamanhoFinal,
      cor: corFinal,
      quantidade: qtd
    });

    Toast.mostrar(`${produto.nome} adicionado ao carrinho!`, 'success');
    Header.atualizarBadge();
  }

  static renderizarGrade(produtos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!produtos || produtos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📦</div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar seus filtros ou buscar por outro termo.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = produtos.map(p => Produtos.criarCard(p)).join('');
  }

  static aplicarFiltros() {
    const busca = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const categoria = document.getElementById('filterCategoria')?.value || '';
    const preco = document.getElementById('filterPreco')?.value || '';
    const cor = document.getElementById('filterCor')?.value || '';
    const tamanho = document.getElementById('filterTamanho')?.value || '';

    let produtos = LojaDB.getProdutos();

    if (busca) {
      produtos = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca) ||
        p.descricao.toLowerCase().includes(busca) ||
        p.categoria.toLowerCase().includes(busca)
      );
    }

    if (categoria) {
      produtos = produtos.filter(p => p.categoria === categoria);
    }

    if (preco) {
      const [min, max] = preco.split('-').map(Number);
      produtos = produtos.filter(p => {
        if (max) return p.preco >= min && p.preco <= max;
        return p.preco >= min;
      });
    }

    if (cor) {
      produtos = produtos.filter(p =>
        p.cores.some(c => c.toLowerCase().includes(cor.toLowerCase()))
      );
    }

    if (tamanho) {
      produtos = produtos.filter(p =>
        p.tamanhos.some(t => t.toLowerCase() === tamanho.toLowerCase())
      );
    }

    const resultsInfo = document.getElementById('resultsInfo');
    if (resultsInfo) {
      resultsInfo.textContent = `${produtos.length} produto${produtos.length !== 1 ? 's' : ''} encontrado${produtos.length !== 1 ? 's' : ''}`;
    }

    Produtos.renderizarGrade(produtos, 'catalogGrid');
  }

  static carregarFiltros() {
    const produtos = LojaDB.getProdutos();
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    const cores = [...new Set(produtos.flatMap(p => p.cores))];
    const tamanhos = [...new Set(produtos.flatMap(p => p.tamanhos))];

    const catSelect = document.getElementById('filterCategoria');
    if (catSelect) {
      categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });
    }

    const corSelect = document.getElementById('filterCor');
    if (corSelect) {
      cores.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        corSelect.appendChild(opt);
      });
    }

    const tamSelect = document.getElementById('filterTamanho');
    if (tamSelect) {
      tamanhos.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        tamSelect.appendChild(opt);
      });
    }
  }
}
