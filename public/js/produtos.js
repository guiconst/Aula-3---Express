// Define a classe que gerencia a página de produtos.
class ProdutosPage {
    // O construtor é chamado na criação da instância da classe.
    constructor() {
        // Mapeia os elementos do HTML para propriedades da classe para fácil acesso.
        this.produtosList = document.getElementById('lista-produtos');
        this.categoriaFiltro = document.getElementById('categoria-filtro');
        
        // --- Formulário de Adicionar Produto ---
        this.addForm = document.getElementById('add-produto-form');
        this.addNome = document.getElementById('add-nome');
        this.addCategoria = document.getElementById('add-categoria');
        this.addPreco = document.getElementById('add-preco');

        // --- Modal de Edição de Produto ---
        this.editModal = document.getElementById('edit-modal');
        this.editForm = document.getElementById('edit-produto-form');
        this.editId = document.getElementById('edit-id'); // Campo escondido para guardar o ID do produto
        this.editNome = document.getElementById('edit-nome');
        this.editCategoria = document.getElementById('edit-categoria');
        this.editPreco = document.getElementById('edit-preco');
        this.closeButton = document.querySelector('.close-button');

        // Array para armazenar os produtos buscados da API.
        this.produtos = [];
        // Inicia a aplicação.
        this.init();
    }

    // Método de inicialização.
    async init() {
        try {
            // Busca e renderiza os produtos na inicialização.
            await this.fetchAndRenderProdutos();
            // Preenche o filtro de categorias.
            await this.populateFiltro();

            // --- Adiciona os Event Listeners (escutadores de eventos) ---
            // Escuta o evento de mudança no filtro de categoria.
            this.categoriaFiltro.addEventListener('change', () => this.filtrarProdutos());
            // Escuta o envio do formulário de adicionar produto.
            this.addForm.addEventListener('submit', (e) => this.addProduto(e));
            // Escuta o envio do formulário de edição de produto.
            this.editForm.addEventListener('submit', (e) => this.updateProduto(e));
            // Escuta o clique no botão de fechar do modal.
            this.closeButton.addEventListener('click', () => this.closeEditModal());
            // Escuta cliques fora do modal para fechá-lo.
            window.addEventListener('click', (e) => {
                if (e.target == this.editModal) {
                    this.closeEditModal();
                }
            });

        } catch (error) {
            // Em caso de erro, exibe no console e na página.
            console.error('Erro ao inicializar a página de produtos:', error);
            this.produtosList.innerHTML = '<p>Erro ao carregar produtos.</p>';
        }
    }

    // Busca produtos na API. Pode receber uma categoria para filtrar.
    async fetchProdutos(categoria = 'todos') {
        let url = '/api/produtos';
        if (categoria !== 'todos') {
            url += `?categoria=${categoria}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro ao buscar produtos');
        }
        const result = await response.json();
        return result.data; // A API agora retorna um objeto com a propriedade 'data'
    }

    // Função que combina a busca e a renderização dos produtos.
    async fetchAndRenderProdutos(categoria = 'todos') {
        this.produtos = await this.fetchProdutos(categoria);
        this.renderProdutos(this.produtos);
    }

    // Renderiza a lista de produtos no HTML.
    renderProdutos(produtos) {
        this.produtosList.innerHTML = produtos.map(produto => `
            <div class="produto" data-id="${produto.id}"> <!-- Armazena o ID do produto no atributo data-id -->
                <h3>${produto.nome}</h3>
                <p>Categoria: ${produto.categoria}</p>
                <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Deletar</button>
            </div>
        `).join('');

        // Adiciona os event listeners para os botões de editar e deletar de CADA produto.
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.openEditModal(e));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteProduto(e));
        });
    }

    // Preenche o <select> de categorias.
    async populateFiltro() {
        const response = await fetch('/api/produtos?limit=1000');
        const result = await response.json();
        const categorias = [...new Set(result.data.map(p => p.categoria))];
        
        this.categoriaFiltro.innerHTML = '<option value="todos">Todas</option>';
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            this.categoriaFiltro.appendChild(option);
        });
    }

    // Filtra os produtos quando uma categoria é selecionada.
    filtrarProdutos() {
        const categoriaSelecionada = this.categoriaFiltro.value;
        this.fetchAndRenderProdutos(categoriaSelecionada);
    }

    // Adiciona um novo produto.
    async addProduto(event) {
        event.preventDefault(); // Impede o recarregamento da página
        const novoProduto = {
            nome: this.addNome.value,
            categoria: this.addCategoria.value,
            preco: parseFloat(this.addPreco.value)
        };

        const response = await fetch('/api/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoProduto),
        });

        if (response.ok) {
            this.addForm.reset(); // Limpa o formulário
            await this.fetchAndRenderProdutos(); // Atualiza a lista de produtos
            await this.populateFiltro(); // Atualiza o filtro de categorias
        } else {
            alert('Erro ao adicionar produto.');
        }
    }

    // Abre o modal de edição com os dados do produto clicado.
    openEditModal(event) {
        const produtoDiv = event.target.closest('.produto');
        const produtoId = produtoDiv.dataset.id;
        const produto = this.produtos.find(p => p.id == produtoId);

        this.editId.value = produto.id;
        this.editNome.value = produto.nome;
        this.editCategoria.value = produto.categoria;
        this.editPreco.value = produto.preco;

        this.editModal.style.display = 'block'; // Mostra o modal
    }

    // Fecha o modal de edição.
    closeEditModal() {
        this.editModal.style.display = 'none'; // Esconde o modal
    }

    // Atualiza um produto existente.
    async updateProduto(event) {
        event.preventDefault();
        const id = this.editId.value;
        const produtoAtualizado = {
            nome: this.editNome.value,
            categoria: this.editCategoria.value,
            preco: parseFloat(this.editPreco.value)
        };

        const response = await fetch(`/api/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(produtoAtualizado),
        });

        if (response.ok) {
            this.closeEditModal();
            await this.fetchAndRenderProdutos();
            await this.populateFiltro();
        } else {
            alert('Erro ao atualizar produto.');
        }
    }

    // Deleta um produto.
    async deleteProduto(event) {
        const produtoDiv = event.target.closest('.produto');
        const id = produtoDiv.dataset.id;

        if (confirm('Tem certeza que deseja deletar este produto?')) {
            const response = await fetch(`/api/produtos/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await this.fetchAndRenderProdutos();
                await this.populateFiltro();
            } else {
                alert('Erro ao deletar produto.');
            }
        }
    }
}

// Cria uma nova instância da classe, iniciando a página de produtos.
new ProdutosPage();