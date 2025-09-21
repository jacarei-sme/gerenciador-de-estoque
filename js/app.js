// IINICIALIZAÇÃO DO SUPABASE
const supabaseUrl = "https://jhxlbkjulksfrcuwfhcb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGxia2p1bGtzZnJjdXdmaGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTczNjQsImV4cCI6MjA3MzM3MzM2NH0.d6KOZxc1iJaI_wloMpa-xura80Fv-YXKijG2wuz5wZg";
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

// LOGIN
const loginForm = document.getElementById('login-form');
const msg = document.getElementById('mensagem');

// SELETORES DE ELEMENTOS - SEÇÕES PRINCIPAIS
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const addProdutoSection = document.getElementById('add-produto-section');
const editProdutoSection = document.getElementById('edit-produto-section');
const categoriasSection = document.getElementById('categorias-section');
const relatorioSection = document.getElementById('relatorio-section');

//MAIN
const btnUltimasMovimentacoes = document.getElementById('btn-ultimas-movimentacoes');
const btnLogout = document.getElementById('btn-logout');
const produtosTbody = document.getElementById('produtos-tbody');

//MOVIMENTAÇÃO
const movimentacaoForm = document.getElementById('movimentacao-form');
const modalMovimentacao = document.getElementById('modal-movimentacao');
const modalTitulo = document.getElementById('modal-titulo');
const btnFecharModal = document.getElementById('btn-fechar-modal');

//ADICIONAR PRODUTOS
const addProdutoForm = document.getElementById('add-produto-form');
const btnAdicionarProduto = document.getElementById('btn-adicionar-produto');
const btnVoltarAddForm = document.getElementById('btn-voltar-add-form');

//EDITAR PRODUTO
const editProdutoForm = document.getElementById('edit-produto-form');
const btnVoltarEditForm = document.getElementById('btn-voltar-edit-form');

//CATEGORIAS
const btnGerenciarCategorias = document.getElementById('btn-gerenciar-categorias');
const categoriaForm = document.getElementById('categoria-form');
const categoriasTbody = document.getElementById('categorias-tbody');
const btnVoltarCategorias = document.getElementById('btn-voltar-categorias');

//RELATÓRIO 
const relatorioTbody = document.getElementById('relatorio-tbody');
const relatorioTitulo = document.getElementById('relatorio-titulo');
const btnRelatorioCompleto = document.getElementById('btn-relatorio-completo');
const btnVoltarRelatorio = document.getElementById('btn-voltar-relatorio');

// FUNÇÕES DE CONTROLE DE VISIBILIDADE
function showSection(sectionToShow) {
    loginSection.classList.add('hidden');
    mainSection.classList.add('hidden');
    addProdutoSection.classList.add('hidden');
    editProdutoSection.classList.add('hidden');
    categoriasSection.classList.add('hidden');
    relatorioSection.classList.add('hidden');

    sectionToShow.classList.remove('hidden');
}

//MOVIMENTAÇÃO
btnUltimasMovimentacoes.addEventListener('click', () => {
    relatorioTitulo.textContent = 'Últimas 20 Movimentações';
    carregarRelatorio(20); 
    showSection(relatorioSection);
});

btnRelatorioCompleto.addEventListener('click', () => {
    relatorioTitulo.textContent = 'Relatório de Movimentações';
    carregarRelatorio();
    showSection(relatorioSection);
});

btnVoltarRelatorio.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

btnAdicionarProduto.addEventListener('click', () => {
    addProdutoForm.reset(); 
    popularDropdownCategorias('add-produto-categoria-select');
    showSection(addProdutoSection);
});

btnVoltarAddForm.addEventListener('click', (e) => { 
    e.preventDefault(); showSection(mainSection); 
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

btnVoltarEditForm.addEventListener('click', (e) => { 
    e.preventDefault(); showSection(mainSection); 
});

async function carregarRelatorio(limite = null) {
    let query = client
        .from('relatorio_completo') //Chama a VIEW criada no supabase contendo as movimentações e usuário que fez.
        .select('*')
        .order('created_at', { ascending: false });

    if (limite) {
        query = query.limit(limite);
    }

    const { data, error } = await query;
          
    if (error) {
        console.error('Erro ao carregar relatório:', error);
        alert('Não foi possível carregar o relatório. Verifique se a View "relatorio_completo" foi criada no Supabase.');
        return;
    }

    relatorioTbody.innerHTML = '';

    if (data.length === 0) {
        relatorioTbody.innerHTML = '<tr><td colspan="6">Nenhuma movimentação encontrada.</td></tr>';
        return;
    }

    data.forEach(mov => {
        const dataFormatada = new Date(mov.created_at).toLocaleString('pt-BR');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${mov.produto_nome}</td>
            <td><span class="${mov.tipo === 'ENTRADA' ? 'entrada' : 'saida'}">${mov.tipo}</span></td>
            <td>${mov.quantidade}</td>
            <td>${mov.usuario_nome || 'Usuário não definido'}</td> 
            <td>${mov.justificativa || '-'}</td>
        `;
        relatorioTbody.appendChild(tr);
    });
}

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
            <td><button class="contrast" onclick="abrirModalMovimentacao(${produto.id}, '${produto.nome}', 'SAIDA')">Retirada</button></td>
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

//MOVIMENTAÇÃO
function abrirModalMovimentacao(id, nome, tipo) {
    modalTitulo.textContent = `Registrar ${tipo === 'ENTRADA' ? 'Entrada' : 'Retirada'} de: ${nome}`;
    
    // Preenche os campos ocultos do formulário do modal
    document.getElementById('mov-produto-id').value = id;
    document.getElementById('mov-tipo').value = tipo;
    
    modalMovimentacao.showModal(); // API nativa do navegador para abrir <dialog>
}

btnFecharModal.addEventListener('click', () => {
    movimentacaoForm.reset();
    modalMovimentacao.close();
});

movimentacaoForm.addEventListener('submit', async (e) => {

    e.preventDefault();
    
    const produtoId = document.getElementById('mov-produto-id').value;
    const tipo = document.getElementById('mov-tipo').value;
    const quantidade = parseInt(document.getElementById('mov-quantidade').value);
    const observacao = document.getElementById('mov-justificativa').value; 

    // Chama a função do supabase RPC
    const { error } = await client.rpc('registrar_movimentacao_e_atualizar_estoque', {
        produto_id_param: produtoId,
        quantidade_param: quantidade,
        tipo_param: tipo,
        observacao_param: observacao
    });

    if (error) {
        alert('Erro ao registrar movimentação: ' + error.message);
        console.error('Erro na chamada RPC:', error);
    } else {
        movimentacaoForm.reset();
        modalMovimentacao.close();
        carregarProdutos();
    }
});

// CATEGORIA
btnGerenciarCategorias.addEventListener('click', () => {
    showSection(categoriasSection);
    carregarCategorias();
});

btnVoltarCategorias.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

async function carregarCategorias() {
    const { data, error } = await client.from('categorias').select('*').order('nome');
    if (error) {
        console.error("Erro ao carregar categorias:", error);
        return;
    }
    categoriasTbody.innerHTML = '';
    data.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cat.nome}</td>
            <td><button class="secondary outline" onclick="deletarCategoria(${cat.id})">Excluir</button></td>
        `;
        categoriasTbody.appendChild(tr);
    });
}

async function deletarCategoria(id) {
    if (!confirm("Tem certeza? Excluir uma categoria pode afetar produtos existentes.")) {
        return;
    }
    const { error } = await client.from('categoria').delete().eq('id', id);
    if (error) {
        alert("Erro ao excluir categoria: " + error.message);
    } else {
        carregarCategorias();
    }
}

async function popularDropdownCategorias(idDoSelect) {
    // 1. Encontra o elemento <select> específico usando o ID que foi passado como argumento
    const selectElement = document.getElementById(idDoSelect);
    if (!selectElement) {
        console.error(`Dropdown com id '${idDoSelect}' não encontrado.`);
        return;
    }

    // 2. Busca todas as categorias no Supabase, ordenadas por nome
    const { data, error } = await client
        .from('categorias')
        .select('*')
        .order('nome');

    if (error) {
        console.error("Erro ao buscar categorias para o dropdown:", error);
        return;
    }

    // 3. Limpa as opções antigas, mantendo apenas a primeira ("Selecione...")
    selectElement.innerHTML = '<option value="">Selecione uma categoria...</option>';

    // 4. Cria e adiciona uma nova <option> para cada categoria encontrada
    data.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nome;
        selectElement.appendChild(option);
    });
}

categoriaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nomeCategoria = document.getElementById('categoria-nome').value;
    const { error } = await client.from('categoria').insert([{ nome: nomeCategoria }]);
    if (error) {
        alert("Erro ao salvar categoria: " + error.message);
    } else {
        categoriaForm.reset();
        carregarCategorias();
    }
});

// AUTENTICAÇÃO
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = "Conectando...";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if(error){
        msg.textContent = "Usuário ou Senha incorretos";
        //msg.textoContent = error.message; Modificado o erro padrão! 
    }
    else {
        localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
        msg.textContent = ""; //Evita que o texto "Conectando" após usar o botão "Sair"
        checkAuth();
    }
});

btnLogout.addEventListener('click', async () => {
    await client.auth.signOut();
    localStorage.removeItem('usuarioLogado');
    checkAuth();
});

function checkAuth() {
    const user = localStorage.getItem('usuarioLogado');
    if (user) {
        showSection(mainSection);
        carregarProdutos();
    } else {
        showSection(loginSection);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});