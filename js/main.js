// ===== TOAST =====
class Toast {
  static container = null;

  static init() {
    if (!Toast.container) {
      Toast.container = document.createElement('div');
      Toast.container.className = 'toast-container';
      document.body.appendChild(Toast.container);
    }
  }

  static mostrar(msg, tipo = '') {
    Toast.init();
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    const icon = tipo === 'success' ? '✓' : tipo === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
      <span class="icon">${icon}</span>
      <span class="msg">${msg}</span>
      <button class="close" onclick="this.parentElement.remove()">✕</button>
    `;
    Toast.container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => toast.remove(), 400);
      }
    }, 4000);
  }
}

// ===== HEADER =====
class Header {
  static init() {
    Header.atualizarBadge();
    Header.initTheme();

    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      if (header && window.scrollY > 50) {
        header.classList.add('scrolled');
      } else if (header) {
        header.classList.remove('scrolled');
      }
    });

    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });
    }
  }

  static atualizarBadge() {
    const itens = LojaDB.getCarrinho();
    document.querySelectorAll('.badge').forEach(el => {
      el.textContent = itens.reduce((acc, i) => acc + i.quantidade, 0);
      el.style.display = itens.length === 0 ? 'none' : 'flex';
    });
  }

  static initTheme() {
    const current = LojaDB.getTema();
    document.documentElement.setAttribute('data-theme', current);

    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.checked = current === 'dark';
      toggle.addEventListener('change', () => {
        const tema = toggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', tema);
        LojaDB.setTema(tema);
      });
    }
  }
}

// ===== HERO SLIDER =====
class HeroSlider {
  static currentSlide = 0;
  static slides = [];
  static interval = null;

  static init() {
    HeroSlider.slides = document.querySelectorAll('.hero-slide');
    HeroSlider.dots = document.querySelectorAll('.hero-dot');
    if (HeroSlider.slides.length === 0) return;

    HeroSlider.slides[0].classList.add('active');
    if (HeroSlider.dots[0]) HeroSlider.dots[0].classList.add('active');

    HeroSlider.startAuto();

    document.querySelectorAll('.hero-arrow').forEach(arrow => {
      arrow.addEventListener('click', () => {
        const dir = arrow.dataset.direction || 'next';
        HeroSlider.goTo(dir === 'next' ? HeroSlider.currentSlide + 1 : HeroSlider.currentSlide - 1);
        HeroSlider.resetAuto();
      });
    });

    HeroSlider.dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        HeroSlider.goTo(idx);
        HeroSlider.resetAuto();
      });
    });
  }

  static goTo(index) {
    const total = HeroSlider.slides.length;
    HeroSlider.currentSlide = ((index % total) + total) % total;

    HeroSlider.slides.forEach(s => s.classList.remove('active'));
    HeroSlider.slides[HeroSlider.currentSlide].classList.add('active');

    if (HeroSlider.dots) {
      HeroSlider.dots.forEach(d => d.classList.remove('active'));
      if (HeroSlider.dots[HeroSlider.currentSlide]) {
        HeroSlider.dots[HeroSlider.currentSlide].classList.add('active');
      }
    }
  }

  static startAuto() {
    HeroSlider.interval = setInterval(() => HeroSlider.goTo(HeroSlider.currentSlide + 1), 5000);
  }

  static resetAuto() {
    clearInterval(HeroSlider.interval);
    HeroSlider.startAuto();
  }
}

// ===== ADMIN =====
class Admin {
  static async init() {
    if (!LojaDB.isAdmin()) {
      document.getElementById('adminPanel')?.classList.add('hidden');
      return;
    }
    document.getElementById('adminLogin')?.classList.add('hidden');
    document.getElementById('adminPanel')?.classList.remove('hidden');
    Admin.carregarTabela();
    Admin.carregarPedidos();
    Admin.initTabs();
    Admin.initForm();
  }

  static initTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  static carregarTabela() {
    const tbody = document.getElementById('adminProdutosBody');
    if (!tbody) return;
    const produtos = LojaDB.getProdutos();
    tbody.innerHTML = produtos.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td><img src="${p.imagem}" alt="" style="width:40px;height:50px;object-fit:cover;border-radius:4px"
                 onerror="this.style.display='none'"></td>
        <td>${p.nome}</td>
        <td>${p.categoria}</td>
        <td>${LojaDB.formatarPreco(p.preco)}</td>
        <td>
          <span class="stock-badge ${p.estoque > 20 ? 'alto' : p.estoque > 5 ? 'medio' : 'baixo'}">
            ${p.estoque}
          </span>
        </td>
        <td>
          <div class="actions">
            <button class="btn-sm btn-edit" onclick="Admin.editar(${p.id})">Editar</button>
            <button class="btn-sm btn-stock" onclick="Admin.alterarEstoque(${p.id})">Estoque</button>
            <button class="btn-sm btn-delete" onclick="Admin.excluir(${p.id})">Excluir</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  static fazerLogin() {
    const senha = document.getElementById('adminSenha')?.value;
    if (LojaDB.loginAdmin(senha)) {
      document.getElementById('adminLogin').classList.add('hidden');
      document.getElementById('adminPanel').classList.remove('hidden');
      Admin.carregarTabela();
      Admin.initTabs();
      Admin.initForm();
      Toast.mostrar('Login realizado com sucesso!', 'success');
    } else {
      Toast.mostrar('Senha incorreta!', 'error');
    }
  }

  static carregarPedidos() {
    const tbody = document.getElementById('adminPedidosBody');
    if (!tbody) return;
    const pedidos = JSON.parse(localStorage.getItem(LojaDB.KEYS.PEDIDOS)) || [];
    if (pedidos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-secondary)">Nenhum pedido registrado</td></tr>';
      return;
    }
    tbody.innerHTML = pedidos.map(p => {
      const data = new Date(p.data);
      const dataStr = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `
        <tr>
          <td><strong>${p.id}</strong></td>
          <td>${p.cliente.nome}<br><small style="color:var(--text-light)">${p.cliente.email}</small></td>
          <td>${LojaDB.formatarPreco(p.total)}</td>
          <td>${p.pagamento === 'credito' ? 'Crédito' : p.pagamento === 'debito' ? 'Débito' : p.pagamento === 'pix' ? 'PIX' : 'Boleto'}</td>
          <td>${dataStr}</td>
          <td><span class="stock-badge alto">${p.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  static fazerLogout() {
    LojaDB.logoutAdmin();
    window.location.reload();
  }

  static editar(id) {
    const produto = LojaDB.getProduto(id);
    if (!produto) return;

    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="cadastro"]')?.classList.add('active');
    document.getElementById('cadastro')?.classList.add('active');

    document.getElementById('formId').value = produto.id;
    document.getElementById('formNome').value = produto.nome;
    document.getElementById('formDescricao').value = produto.descricao;
    document.getElementById('formCategoria').value = produto.categoria;
    document.getElementById('formTamanhos').value = produto.tamanhos.join(', ');
    document.getElementById('formCores').value = produto.cores.join(', ');
    document.getElementById('formPreco').value = produto.preco;
    document.getElementById('formEstoque').value = produto.estoque;
    document.getElementById('formImagem').value = produto.imagem;
    document.getElementById('formDestaque').checked = produto.destaque;
    document.getElementById('formNovidade').checked = produto.novidade;
    document.getElementById('formMaisVendido').checked = produto.maisVendido;

    document.getElementById('formSubmit').textContent = 'Atualizar Produto';
  }

  static alterarEstoque(id) {
    const produto = LojaDB.getProduto(id);
    if (!produto) return;
    const nova = prompt(`Estoque atual: ${produto.estoque}\nNovo valor:`, produto.estoque);
    if (nova !== null && !isNaN(nova) && parseInt(nova) >= 0) {
      LojaDB.editarProduto(id, { estoque: parseInt(nova) });
      Admin.carregarTabela();
      Toast.mostrar('Estoque atualizado!', 'success');
    }
  }

  static excluir(id) {
    const produto = LojaDB.getProduto(id);
    if (!produto) return;
    if (confirm(`Excluir "${produto.nome}" permanentemente?`)) {
      LojaDB.excluirProduto(id);
      Admin.carregarTabela();
      Toast.mostrar('Produto excluído!', '');
    }
  }

  static initForm() {
    const form = document.getElementById('adminForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const dados = {
        nome: document.getElementById('formNome').value.trim(),
        descricao: document.getElementById('formDescricao').value.trim(),
        categoria: document.getElementById('formCategoria').value.trim(),
        tamanhos: document.getElementById('formTamanhos').value.split(',').map(s => s.trim()).filter(Boolean),
        cores: document.getElementById('formCores').value.split(',').map(s => s.trim()).filter(Boolean),
        preco: parseFloat(document.getElementById('formPreco').value),
        estoque: parseInt(document.getElementById('formEstoque').value),
        imagem: document.getElementById('formImagem').value.trim(),
        destaque: document.getElementById('formDestaque').checked,
        novidade: document.getElementById('formNovidade').checked,
        maisVendido: document.getElementById('formMaisVendido').checked
      };

      if (!dados.nome || !dados.categoria || !dados.preco || isNaN(dados.estoque)) {
        Toast.mostrar('Preencha todos os campos obrigatórios!', 'error');
        return;
      }

      const editId = parseInt(document.getElementById('formId').value);
      if (editId) {
        LojaDB.editarProduto(editId, dados);
        Toast.mostrar('Produto atualizado!', 'success');
      } else {
        dados.data = new Date().toISOString().split('T')[0];
        LojaDB.adicionarProduto(dados);
        Toast.mostrar('Produto cadastrado!', 'success');
      }

      form.reset();
      document.getElementById('formId').value = '';
      document.getElementById('formSubmit').textContent = 'Cadastrar Produto';
      Admin.carregarTabela();
    });
  }

  static async uploadImgBB() {
    const input = document.getElementById('formImagemUpload');
    const preview = document.getElementById('formImagemPreview');
    const urlInput = document.getElementById('formImagem');

    if (!input || !input.files || !input.files[0]) {
      Toast.mostrar('Selecione uma imagem primeiro', 'error');
      return;
    }

    const file = input.files[0];
    if (file.size > 32 * 1024 * 1024) {
      Toast.mostrar('Imagem muito grande! Máx: 32MB', 'error');
      return;
    }

    if (preview) {
      preview.innerHTML = '<div class="spinner spinner-sm" style="margin:0 auto"></div><p style="margin-top:10px">Enviando...</p>';
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=849ff64039fc5da756442889c526728a', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        const url = data.data.url;
        if (urlInput) urlInput.value = url;
        if (preview) {
          preview.innerHTML = `<img src="${url}" alt="Preview">`;
        }
        Toast.mostrar('Imagem enviada com sucesso!', 'success');
      } else {
        Toast.mostrar('Erro ao enviar imagem: ' + (data.error?.message || 'Erro desconhecido'), 'error');
        if (preview) preview.innerHTML = '<span>Clique para selecionar</span>';
      }
    } catch (err) {
      if (preview) preview.innerHTML = '<span>Clique para selecionar</span>';
      Toast.mostrar('Erro de conexão ao enviar imagem', 'error');
    }
  }
}

// ===== SCROLL TOP =====
class ScrollTop {
  static init() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ===== PAGE INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  await LojaDB.init();
  Header.init();
  ScrollTop.init();

  const page = document.body.dataset.page;

  if (page === 'catalogo') {
    Produtos.carregarFiltros();
    Produtos.aplicarFiltros();

    document.getElementById('searchInput')?.addEventListener('input', Produtos.aplicarFiltros);
    document.querySelectorAll('.filter-select').forEach(el => {
      el.addEventListener('change', Produtos.aplicarFiltros);
    });
  }

  if (page === 'index') {
    HeroSlider.init();

    const todos = LojaDB.getProdutos();
    Produtos.renderizarGrade(todos.filter(p => p.destaque).slice(0, 8), 'destaqueGrid');
    Produtos.renderizarGrade(todos.filter(p => p.maisVendido).slice(0, 4), 'maisVendidosGrid');
    Produtos.renderizarGrade(todos.filter(p => p.novidade).slice(0, 4), 'novidadesGrid');
  }

  if (page === 'produto') {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    if (id) {
      CarregarProduto.init(id);
    }
  }

  if (page === 'carrinho') {
    Carrinho.renderizar();
  }

  if (page === 'checkout') {
    if (new URLSearchParams(window.location.search).has('success')) {
      Carrinho.exibirSucesso();
    } else {
      Carrinho.renderizarCheckoutResumo();
    }
  }

  if (page === 'admin') {
    Admin.init();
  }
});

// ===== PRODUCT PAGE LOADER =====
class CarregarProduto {
  static init(id) {
    const produto = LojaDB.getProduto(id);
    if (!produto) {
      document.querySelector('.product-detail')?.remove();
      document.body.innerHTML = `
        <div class="container" style="padding-top:120px;text-align:center;min-height:60vh">
          <h1>Produto não encontrado</h1>
          <p style="margin:20px 0">O produto que você procura não está disponível.</p>
          <a href="catalogo.html" class="btn btn-primary">Ver Catálogo</a>
        </div>
      `;
      return;
    }

    document.title = `${produto.nome} - StyleStore`;
    CarregarProduto.renderizar(produto);
  }

  static renderizar(produto) {
    const container = document.getElementById('produtoDetail');
    if (!container) return;

    document.getElementById('produtoBreadcrumb').innerHTML = `
      <a href="index.html">Home</a> &gt;
      <a href="catalogo.html">${produto.categoria}</a> &gt;
      <span>${produto.nome}</span>
    `;

    const badges = [];
    if (produto.destaque) badges.push('<span class="product-badge destaque">Destaque</span>');
    if (produto.novidade) badges.push('<span class="product-badge novidade">Novidade</span>');
    if (produto.maisVendido) badges.push('<span class="product-badge vendido">Mais Vendido</span>');

    const corOptions = produto.cores.map(c => {
      const colorMap = {
        'Preto': '#1a1a1a', 'Branca': '#f5f5f5', 'Branco': '#f5f5f5',
        'Cinza': '#808080', 'Azul': '#2d6da8', 'Azul Claro': '#8bb8e8',
        'Azul Escuro': '#1a3a5c', 'Azul Marinho': '#1a2d4a',
        'Vermelho': '#c0392b', 'Rosa': '#e8a0b4', 'Verde': '#27ae60',
        'Verde Militar': '#4a5d23', 'Bege': '#d4b896', 'Castanho': '#8B4513',
        'Vinho': '#722f37', 'Marrom': '#6d4c2d', 'Cinza Chumbo': '#3d3d3d'
      };
      const bg = colorMap[c] || '#ddd';
      return `<div class="option-item color-item" style="background:${bg}" data-cor="${c}" title="${c}"></div>`;
    }).join('');

    const tamOptions = produto.tamanhos.map(t =>
      `<div class="option-item" data-tamanho="${t}">${t}</div>`
    ).join('');

    const estoqueClass = produto.estoque > 20 ? 'alto' : produto.estoque > 5 ? 'medio' : 'baixo';

    container.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-gallery">
          <div class="product-gallery-main">
            <img src="${produto.imagem}" alt="${produto.nome}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22500%22><rect fill=%22%23f0f0f0%22 width=%22500%22 height=%22500%22/><text fill=%22%23999%22 font-size=%2224%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22>Sem Imagem</text></svg>'">
            <div class="product-badges">${badges.join('')}</div>
          </div>
          <div class="product-gallery-thumbs">
            <div class="gallery-thumb active">
              <img src="${produto.imagem}" alt="">
            </div>
          </div>
        </div>
        <div class="product-info">
          <div class="category">${produto.categoria}</div>
          <h1>${produto.nome}</h1>
          <div class="rating">
            <span class="stars">★★★★★</span>
            <span>(42 avaliações)</span>
          </div>
          <div class="price">
            ${LojaDB.formatarPreco(produto.preco)}
          </div>
          <div class="installments">ou em até 3x de ${LojaDB.formatarPreco(produto.preco / 3)} sem juros</div>
          <div style="margin-bottom:15px">
            <span class="stock-badge ${estoqueClass}">${produto.estoque} unidades em estoque</span>
          </div>
          <div class="description">${produto.descricao}</div>

          <div class="product-options">
            <div class="option-group">
              <label>Cor: <span id="selectedCor">Selecione</span></label>
              <div class="options" id="corOptions">
                ${corOptions}
              </div>
            </div>
            <div class="option-group">
              <label>Tamanho: <span id="selectedTamanho">Selecione</span></label>
              <div class="options" id="tamanhoOptions">
                ${tamOptions}
              </div>
            </div>
          </div>

          <div class="qty-selector">
            <label>Quantidade:</label>
            <div class="qty-controls">
              <button onclick="CarregarProduto.alterarQtd(-1)">−</button>
              <input type="text" id="prodQtd" value="1" readonly>
              <button onclick="CarregarProduto.alterarQtd(1)">+</button>
            </div>
          </div>

          <div class="product-actions">
            <button class="btn btn-primary btn-large" onclick="CarregarProduto.comprarAgora(${produto.id})">
              Comprar Agora
            </button>
            <button class="btn btn-outline btn-large" style="border-color:var(--secondary);color:var(--secondary)" onclick="CarregarProduto.adicionarCarrinho(${produto.id})">
              + Carrinho
            </button>
            <button class="btn btn-whatsapp" onclick="CarregarProduto.whatsapp(${produto.id})">
              📱 Consultar
            </button>
          </div>

          <div class="product-share">
            <span>Compartilhar:</span>
            <div class="share-btns">
              <button class="share-btn" onclick="Produtos.compartilhar(${produto.id})" title="Copiar link">🔗</button>
              <button class="share-btn" onclick="window.open('https://wa.me/5511999999999?text=${encodeURIComponent('Olá! Vi este produto e tenho interesse: ' + produto.nome + ' - ' + window.location.href)}')" title="WhatsApp">📱</button>
              <button class="share-btn" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href))" title="Facebook">f</button>
            </div>
          </div>
        </div>
      </div>
    `;

    CarregarProduto.initOptions(produto);
  }

  static initOptions(produto) {
    document.querySelectorAll('#corOptions .color-item').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('#corOptions .color-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('selectedCor').textContent = el.dataset.cor;
      });
    });

    document.querySelectorAll('#tamanhoOptions .option-item').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('#tamanhoOptions .option-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('selectedTamanho').textContent = el.dataset.tamanho;
      });
    });

    if (produto.cores.length === 1) {
      const el = document.querySelector('#corOptions .color-item');
      if (el) {
        el.classList.add('selected');
        document.getElementById('selectedCor').textContent = el.dataset.cor;
      }
    }

    if (produto.tamanhos.length === 1) {
      const el = document.querySelector('#tamanhoOptions .option-item');
      if (el) {
        el.classList.add('selected');
        document.getElementById('selectedTamanho').textContent = el.dataset.tamanho;
      }
    }
  }

  static alterarQtd(delta) {
    const input = document.getElementById('prodQtd');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
  }

  static adicionarCarrinho(id) {
    const cor = document.querySelector('#corOptions .selected')?.dataset.cor;
    const tamanho = document.querySelector('#tamanhoOptions .selected')?.dataset.tamanho;
    const qtd = parseInt(document.getElementById('prodQtd')?.value || 1);

    if (!cor && document.querySelectorAll('#corOptions .color-item').length > 0) {
      Toast.mostrar('Selecione uma cor', 'error');
      return;
    }
    if (!tamanho && document.querySelectorAll('#tamanhoOptions .option-item').length > 0) {
      Toast.mostrar('Selecione um tamanho', 'error');
      return;
    }

    Produtos.addToCart(id, tamanho, cor, qtd);
  }

  static comprarAgora(id) {
    CarregarProduto.adicionarCarrinho(id);
    setTimeout(() => window.location.href = 'checkout.html', 500);
  }

  static whatsapp(id) {
    const produto = LojaDB.getProduto(id);
    if (!produto) return;
    const msg = `Olá! Tenho interesse no produto: ${produto.nome} (${LojaDB.formatarPreco(produto.preco)})`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
