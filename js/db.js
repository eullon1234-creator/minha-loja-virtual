class LojaDB {
  static KEYS = {
    PRODUTOS: 'loja_produtos',
    CARRINHO: 'loja_carrinho',
    FAVORITOS: 'loja_favoritos',
    TEMA: 'loja_tema',
    PEDIDOS: 'loja_pedidos',
    ADMIN_SESSION: 'loja_admin'
  };

  static async init() {
    try {
      const response = await fetch('data/produtos.json');
      const data = await response.json();
      const stored = localStorage.getItem(LojaDB.KEYS.PRODUTOS);
      if (!stored) {
        localStorage.setItem(LojaDB.KEYS.PRODUTOS, JSON.stringify(data.produtos));
      } else {
        const parsed = JSON.parse(stored);
        if (parsed.length === 0) {
          localStorage.setItem(LojaDB.KEYS.PRODUTOS, JSON.stringify(data.produtos));
        }
      }
      return true;
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      return false;
    }
  }

  static getProdutos() {
    try {
      return JSON.parse(localStorage.getItem(LojaDB.KEYS.PRODUTOS)) || [];
    } catch {
      return [];
    }
  }

  static getProduto(id) {
    const produtos = LojaDB.getProdutos();
    return produtos.find(p => p.id === id) || null;
  }

  static salvarProdutos(produtos) {
    localStorage.setItem(LojaDB.KEYS.PRODUTOS, JSON.stringify(produtos));
  }

  static adicionarProduto(produto) {
    const produtos = LojaDB.getProdutos();
    produto.id = Date.now();
    produtos.push(produto);
    LojaDB.salvarProdutos(produtos);
    return produto;
  }

  static editarProduto(id, dados) {
    const produtos = LojaDB.getProdutos();
    const idx = produtos.findIndex(p => p.id === id);
    if (idx === -1) return false;
    produtos[idx] = { ...produtos[idx], ...dados };
    LojaDB.salvarProdutos(produtos);
    return true;
  }

  static excluirProduto(id) {
    const produtos = LojaDB.getProdutos().filter(p => p.id !== id);
    LojaDB.salvarProdutos(produtos);
  }

  static getCarrinho() {
    try {
      return JSON.parse(localStorage.getItem(LojaDB.KEYS.CARRINHO)) || [];
    } catch {
      return [];
    }
  }

  static salvarCarrinho(itens) {
    localStorage.setItem(LojaDB.KEYS.CARRINHO, JSON.stringify(itens));
  }

  static adicionarAoCarrinho(item) {
    const carrinho = LojaDB.getCarrinho();
    const idx = carrinho.findIndex(
      i => i.id === item.id && i.tamanho === item.tamanho && i.cor === item.cor
    );
    if (idx >= 0) {
      carrinho[idx].quantidade += item.quantidade;
    } else {
      carrinho.push(item);
    }
    LojaDB.salvarCarrinho(carrinho);
    return carrinho;
  }

  static removerDoCarrinho(index) {
    const carrinho = LojaDB.getCarrinho();
    carrinho.splice(index, 1);
    LojaDB.salvarCarrinho(carrinho);
    return carrinho;
  }

  static atualizarQuantidade(index, qtd) {
    const carrinho = LojaDB.getCarrinho();
    if (qtd <= 0) {
      carrinho.splice(index, 1);
    } else {
      carrinho[index].quantidade = qtd;
    }
    LojaDB.salvarCarrinho(carrinho);
    return carrinho;
  }

  static limparCarrinho() {
    localStorage.removeItem(LojaDB.KEYS.CARRINHO);
  }

  static getFavoritos() {
    try {
      return JSON.parse(localStorage.getItem(LojaDB.KEYS.FAVORITOS)) || [];
    } catch {
      return [];
    }
  }

  static toggleFavorito(id) {
    let favs = LojaDB.getFavoritos();
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
    } else {
      favs.push(id);
    }
    localStorage.setItem(LojaDB.KEYS.FAVORITOS, JSON.stringify(favs));
    return favs.includes(id);
  }

  static isFavorito(id) {
    return LojaDB.getFavoritos().includes(id);
  }

  static getTema() {
    return localStorage.getItem(LojaDB.KEYS.TEMA) || 'light';
  }

  static setTema(tema) {
    localStorage.setItem(LojaDB.KEYS.TEMA, tema);
  }

  static isAdmin() {
    return sessionStorage.getItem(LojaDB.KEYS.ADMIN_SESSION) === 'true';
  }

  static loginAdmin(senha) {
    if (senha === 'admin123') {
      sessionStorage.setItem(LojaDB.KEYS.ADMIN_SESSION, 'true');
      return true;
    }
    return false;
  }

  static logoutAdmin() {
    sessionStorage.removeItem(LojaDB.KEYS.ADMIN_SESSION);
  }

  static salvarPedido(pedido) {
    const pedidos = JSON.parse(localStorage.getItem(LojaDB.KEYS.PEDIDOS)) || [];
    pedido.id = 'PED-' + Date.now();
    pedido.data = new Date().toISOString();
    pedido.status = 'Confirmado';
    pedidos.unshift(pedido);
    localStorage.setItem(LojaDB.KEYS.PEDIDOS, JSON.stringify(pedidos));
    return pedido;
  }

  static formatarPreco(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  }

  static calcularFrete(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return null;
    const prefixo = parseInt(cepLimpo.substring(0, 5));
    const valor = prefixo < 30000 ? 19.90 : prefixo < 50000 ? 14.90 : 9.90;
    return { valor, prazo: Math.floor(Math.random() * 5) + 5 };
  }
}
