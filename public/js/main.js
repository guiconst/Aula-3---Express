//Define a classe principal da aplicação para a página inicial.
class PadariaApp{
    // O construtor é chamado qundo uma nova instância de classe é criada.
    constructor(){
        //Encontra o elemento no HTML que vai conter a lista de categorias.
        this.categoriasContainer = document.getElementById('lista-categorias');
        //chama o método init() para iniciar a aplicação .
        this.init();
    }

    //Método de inicialização da aplicação
    async init() {
        try{
            //Tenta buscar as categorias da API
            const categorias = await this.fetchCategorias();
            //Se a busca for bem-sucedida, redenriza as categorias na página.
            this.renderCategorias(categorias);
        }catch (error) {
            //Se ocorrer um erro na busca, exibe uma mensagem de erro no console e na página
            console.error('Erro ao inicializar a aplicação:', error);
            this.categoriasContaoner.innerHTML = '<p> Erro ao carregar categorias. </p>'
        }
    }

    //Método assíncrono para buscar as categorias dos produtos na API.
    async fetchCategorias() {
        //Faz uma requisição GET para a API de produtos, pedindo um limite alto para garantir que todas as categorias sejam representadas.
        const response = await fetch('/api/produtos?limit=1000');
        //Verifica se a resposta da requisição dos bem-sucedida.
        if (!response.ok) {
            //se não for, lança um erro.
            throw new Error('Erro ao buscar produtos');
        }
        //Converte a resposta da API de JSON para um objeto JavaScript.
        const result = await response.json();

        //extrai as categorias de todos os produtos
        //"map" cria um novo array
        //"new Set" remove as duplicadas
        //"..." converte o Set de volta para array
        const categorias =[...new Set(result.data.map( p => p.categoria))];
        //retorna o array de categorias
        return categorias;
    }

    //metodo para renderizar as categorias na pagina HTML
    renderCategorias(categorias){
        //o link leva
        this.categoriasContainer.innerHTMl = categorias.map(categoria => `
        <a href="produtos.html?categoria=${categoria}" class="category-card">
            <h3>${categoria}</h3>
        </a>
        `).join('');//join junta todos os elementos em uma unica string de HTML
    }

}
//Cria um nova instância da classe PadariaApp que inicia todo o processo.
new PadariaApp();
