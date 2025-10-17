const btnProdutosSection = document.getElementById('btn-produtos');
const produtosTbody = document.getElementById('produtos-tbody');
//ADICIONAR OS PRODUTOS
const btnAdicionarProduto = document.getElementById('btn-adicionar-produto');
const addProdutoForm = document.getElementById('add-produto-form');
const btnVoltarAddForm = document.getElementById('btn-voltar-add-form');
//EDITAR OS PRODUTOS
const editProdutoForm = document.getElementById('edit-produto-form');
const btnVoltarEditForm = document.getElementById('btn-voltar-edit-form');
//FILTRAR OS PRODUTOS
const inputBuscaProduto = document.getElementById('input-busca-produto');
const filtroCategoriaSelect = document.getElementById('filtro-categoria-select');
let listaCompletaProdutos = [];
inputBuscaProduto.addEventListener('keyup', renderizarTabelaProdutos);
filtroCategoriaSelect.addEventListener('change', renderizarTabelaProdutos);

async function carregarListaCompletaProdutos() {
    const { data: produtos, error } = await client
        .from('produto')
        .select(`
            id, nome, descricao, quantidade, id_categoria,
            categorias ( nome )
        `)
        .order('nome', { ascending: true });

    if (error) {
        console.error("Erro ao carregar lista de produtos:", error);
        listaCompletaProdutos = [];
    } else {
        listaCompletaProdutos = produtos;
    }

    renderizarTabelaProdutos();
}

function renderizarTabelaProdutos() {
    const termoBusca = inputBuscaProduto.value.toLowerCase();
    const categoriaId = filtroCategoriaSelect.value;

    const produtosFiltrados = listaCompletaProdutos.filter(produto => {
        const matchNome = produto.nome.toLowerCase().includes(termoBusca);
        const matchCategoria = (categoriaId === 'todos') || (produto.id_categoria == categoriaId);
        return matchNome && matchCategoria;
    });

    produtosTbody.innerHTML = '';
    const feedbackEl = document.getElementById('feedback-dinamico');

    if (produtosFiltrados.length === 0) {
        produtosTbody.innerHTML = '<tr><td colspan="4">Nenhum produto encontrado.</td></tr>';
        feedbackEl.textContent = 'Nenhum produto encontrado.';
        return;
    }

    produtosFiltrados.forEach(produto => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.descricao}</td>
            <td><strong>${produto.quantidade}</strong></td>
            <td>
                <button onclick="abrirModalMovimentacao(${produto.id}, '${produto.nome}', 'ENTRADA')">Entrada</button>
                <button class="contrast" onclick="abrirModalMovimentacao(${produto.id}, '${produto.nome}', 'SAIDA')">Retirada</button>
                <button class="secondary outline" onclick="prepararEdicao(${produto.id}, '${produto.nome}', '${produto.descricao}', ${produto.id_categoria})">Editar</button>
            </td>
        `;
        produtosTbody.appendChild(tr);
    });
    
    feedbackEl.textContent = `${produtosFiltrados.length} produtos encontrados. A tabela foi atualizada.`;
}

function prepararEdicao(id, nome, descricao, id_categoria) {
    document.getElementById('edit-produto-id').value = id;
    document.getElementById('edit-produto-nome').value = nome;
    document.getElementById('edit-produto-descricao').value = descricao;
    
    popularDropdownCategorias('edit-produto-categoria-select').then(() => {
        document.getElementById('edit-produto-categoria-select').value = id_categoria;
    });
    
    showSection(editProdutoSection);
}

btnProdutosSection.addEventListener('click', async (e) => {
    e.preventDefault();
    showSection(loadingSection);
    
    await popularFiltroCategorias();    
    await carregarListaCompletaProdutos();
    
    showSection(produtosSection);
});

btnAdicionarProduto.addEventListener('click', () => {
    addProdutoForm.reset(); 
    popularDropdownCategorias('add-produto-categoria-select');
    showSection(addProdutoSection);
});

addProdutoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('add-produto-nome').value;
    const descricao = document.getElementById('add-produto-descricao').value;
    const id_categoria = document.getElementById('add-produto-categoria-select').value;
    const quantidadeInicial = parseInt(document.getElementById('add-produto-quantidade-inicial').value) || 0;

    const { data: novoProduto, error: produtoError } = await client
        .from('produto')
        .insert([{ 
            nome: nome, 
            descricao: descricao, 
            id_categoria: id_categoria,
            quantidade: quantidadeInicial
        }])
        .select();

    if (produtoError) {
        alert('Erro ao cadastrar o produto: ' + produtoError.message);
        console.error("Erro ao inserir produto:", produtoError);
        
        return;
    }

    if (quantidadeInicial > 0) {
        const { auth } = await client;
        const { data: { user } } = await auth.getUser();
        const novoProdutoId = novoProduto[0].id;

        const { error: movError } = await client
            .from('movimentacao')
            .insert([{
                id_produto: novoProdutoId,
                id_usuario: user.id,
                tipo: 'ENTRADA',
                quantidade: quantidadeInicial,
                observacao: 'Carga inicial de estoque'
            }]);
        
        if (movError) {
            alert('Produto cadastrado com sucesso, mas houve um erro ao registrar a movimentação inicial no histórico.');
            console.error("Erro ao inserir movimentação inicial:", movError);
        }
    }

    await carregarListaCompletaProdutos();
    
    showSection(produtosSection);
});

btnVoltarAddForm.addEventListener('click', (e) => { 
    e.preventDefault(); 
    showSection(produtosSection); 
});

editProdutoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-produto-id').value;
    const nome = document.getElementById('edit-produto-nome').value;
    const descricao = document.getElementById('edit-produto-descricao').value;
    const id_categoria = document.getElementById('edit-produto-categoria-select').value;

    const { error } = await client.from('produto')
        .update({ nome, descricao, id_categoria })
        .eq('id', id);

    if (error) {
        alert('Erro ao atualizar o produto: ' + error.message);
    } else {
        showSection(loadingSection);
        
        await carregarListaCompletaProdutos();    
        showSection(produtosSection);
    }
});

btnVoltarEditForm.addEventListener('click', (e) => { 
    e.preventDefault(); 
    showSection(produtosSection); 
});
