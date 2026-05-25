# StyleStore - Loja Virtual de Roupas

Aplicação web completa de loja de roupas, construída com HTML, CSS e JavaScript puro. Pronto para hospedagem no GitHub Pages.

🔗 **Link do App:** https://eullon1234-creator.github.io/minha-loja-virtual/

## Funcionalidades

- Página inicial com banner rotativo, produtos em destaque, mais vendidos e novidades
- Catálogo com busca por nome e filtros por categoria, preço, cor e tamanho
- Página de produto com galeria, seleção de cor/tamanho e quantidade
- Carrinho de compras completo (adicionar, alterar qtd, remover, calcular totais)
- Checkout com formulário de cliente e 4 formas de pagamento (crédito, débito, PIX, boleto)
- Sistema de favoritos
- Modo escuro/claro
- Compartilhamento de produtos
- WhatsApp integrado para atendimento
- Painel administrativo protegido por senha
- Upload de imagens via ImgBB

## Páginas

| Página | Descrição |
|--------|-----------|
| `/` | Home |
| `/catalogo.html` | Catálogo com filtros |
| `/produto.html?id=1` | Detalhes do produto |
| `/carrinho.html` | Carrinho |
| `/checkout.html` | Finalizar pedido |
| `/admin.html` | Painel admin |
| `/favoritos.html` | Favoritos |

## Painel Admin

**Senha:** `admin123` (pode ser alterada em `js/db.js`)

Funcionalidades do admin:
- Cadastrar, editar e excluir produtos
- Alterar estoque
- Upload de imagens para ImgBB
- Visualizar pedidos

## Tecnologias

- HTML5
- CSS3 (design responsivo, modo escuro/claro, animações)
- JavaScript puro (ES6+)
- localStorage para persistência
- ImgBB API para upload de imagens

## Como usar

1. Acesse https://eullon1234-creator.github.io/minha-loja-virtual/
2. Navegue pelo catálogo e adicione produtos ao carrinho
3. Finalize a compra no checkout
4. Para admin, vá em `/admin.html` - senha: `admin123`

## Desenvolvimento

Para editar os produtos, modifique o arquivo `data/produtos.json` ou use o painel admin.
