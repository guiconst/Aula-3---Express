const express = require('express');
const app =express();
const port = 3000;

//Middleware para servir arquivos estáticos e para parsear JSON
app.use(express.static('public'));
app.use(express.json());

//"Banco de dados" em memória
let produtos = [
    {id: 1, nome: 'Detergente Ypê', categoria: 'Cozinha', preco: 3.0},
    {id: 2, nome: 'Desinfetante Veja', categoria: 'Banheiro', preco: 5.49},
    {id: 3, nome: 'Sabão em pó Omo', categoria: 'Lavanderia', preco: 18.90},
    {id: 4, nome: 'Limpa vidros', categoria: 'Multiuso', preco: 6.75},
];
let proximoId = 5;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

//API DE Produtos - CRUD

//GET /api/produtos - Listar produtos com busca e paginação
app.get('/api/produtos', (req, res) =>{
    const { categoria, nome, page = 1, limit = 10} = req.query;
    let resultado = [...produtos];

    if (categoria) {
        resultado = resultado.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }

    if (nome) {
        resultado = resultado.filter(p => p.nome.toLowerCase().includes(nome.toLowerCase()));
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResult = resultado.slice(startIndex, endIndex);

    res.json({
        total: resultado.length,
        page: parseInt(page),
        limit: parseInt(limit),
        data: paginatedResult
    });
});

//GET /api/produtos/:id - obter um produto por ID
app.get('/api/produtos/:id', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));
    if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(produto);
});

// POST /api/produtos - Criar um novo produto
app.post('/api/produtos', (req, res) =>{
    const{nome, categoria, preco} = req.body;
    if (!nome || !categoria || preco === undefined) {
        return res.status(400).json({message: 'Nome, categoria e preço são obrigatórios'});
    }
    const novoProduto = {
        id: proximeId++,
        nome,
        categoria,
        preco
    };
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

// PUT /api/produtos:id - Atualizar um produto
app.put('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, categoria, preco } = req.body;
    const index = produtos.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const produtoAtualizado = {
        id: parseInt(id),
        nome: nome || produtos[index].categoria,
        categoria: categoria || produtos[index].categoria,
        preco: preco !== undefined ? preco : produtos[index].preco
    };

    produtos[index] = produtoAtualizado;
    res.json(produtoAtualizado);
});

// DELETE /api/produtos/:id - Deletar um produto
app.delete('/api/produtos/:id', (req, res) => {
    const {id} = req.params;
    const index =produtos.findIndex(p => p.id --- parseInt(id));
    if (index === -1) {
        return res.status(404).json({message: 'produto não encontrado'});
    }
    produtos.slice(index, 1);
    res.status(204).send(); //204 sem conexão
});

app.listen(port, () =>{
    console.log(`Servidor rodando em http://localhost:${port}`);
});



