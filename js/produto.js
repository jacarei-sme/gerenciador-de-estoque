//ADICIONAR PRODUTOS
const btnProdutosSection = document.getElementById('btn-produtos');
const addProdutoForm = document.getElementById('add-produto-form');
const btnAdicionarProduto = document.getElementById('btn-adicionar-produto');
const btnVoltarAddForm = document.getElementById('btn-voltar-add-form');
const produtosTbody = document.getElementById('produtos-tbody');

//EDITAR PRODUTO
const editProdutoForm = document.getElementById('edit-produto-form');
const btnVoltarEditForm = document.getElementById('btn-voltar-edit-form');

//PRODUTOS
async function carregarProdutos() {
    let { data: movimentacoes, error: movError } = await client
        .from('movimentacao')
        .select('id_produto, tipo, quantidade');

    if (movError) {
        console.error('Erro ao buscar movimentações:', movError);
        return;
    }
    
    const estoque = {};
    movimentacoes.forEach(mov => {
        if (!estoque[mov.id_produto]) {
            estoque[mov.id_produto] = 0;
        }
        if (mov.tipo === 'ENTRADA') {
            estoque[mov.id_produto] += mov.quantidade;
        } else { // == 'SAIDA'
            estoque[mov.id_produto] -= mov.quantidade;
        }
    });


    const { data: produtos, error } = await client
        .from('produto')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        console.error('Erro ao carregar produtos:', error);
        return;
    }

    produtosTbody.innerHTML = '';
    produtos.forEach(produto => {

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.descricao}</td>
            <td><strong>${produto.quantidade}</strong></td>
            <td><button class="outline" onclick="prepararEdicao(${produto.id},'${produto.nome}', '${produto.descricao}')">Editar</button></td>
            <td><button onclick="abrirModalMovimentacao(${produto.id}, '${produto.nome}', 'ENTRADA')">Entrada</button></td>
            <td><button class="contrast" onclick="abrirModalMovimentacao(${produto.id}, '${produto.nome}', 'SAIDA')">Saída</button></td>
        `;
        produtosTbody.appendChild(tr);
    });
}

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

    showSection(mainSection);
    carregarProdutos();
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
        showSection(mainSection);
        carregarProdutos();
    }
});

function prepararEdicao(id, nome, descricao, id_categoria) {
    document.getElementById('edit-produto-id').value = id;
    document.getElementById('edit-produto-nome').value = nome;
    document.getElementById('edit-produto-descricao').value = descricao;
    
    popularDropdownCategorias('edit-produto-categoria-select').then(() => {
        document.getElementById('edit-produto-categoria-select').value = id_categoria;
    });
    
    showSection(editProdutoSection);
}

btnAdicionarProduto.addEventListener('click', () => {
    addProdutoForm.reset(); 
    popularDropdownCategorias('add-produto-categoria-select');
    showSection(addProdutoSection);
});

btnProdutosSection.addEventListener('click', async (e) => {
    e.preventDefault();
    showSection(loadingSection);
    await carregarProdutos();
    showSection(produtosSection);
});
btnVoltarAddForm.addEventListener('click', (e) => { 
    e.preventDefault(); 
    showSection(produtosSection); 
});

btnVoltarEditForm.addEventListener('click', (e) => { 
    e.preventDefault(); 
    showSection(produtosSection); 
});