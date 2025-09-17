// IINICIALIZAÇÃO DO SUPABASE
const supabaseUrl = "https://jhxlbkjulksfrcuwfhcb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGxia2p1bGtzZnJjdXdmaGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTczNjQsImV4cCI6MjA3MzM3MzM2NH0.d6KOZxc1iJaI_wloMpa-xura80Fv-YXKijG2wuz5wZg";
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

// SELETORES DE ELEMENTOS
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const movimentacaoSection = document.getElementById('movimentacao-section');

// LOGIN
const loginForm = document.getElementById('login-form');
const msg = document.getElementById('mensagem');

// BOTÃO DA TELA INICIAL
const btnMovimentacao = document.getElementById('btn-movimentacao');
const btnVoltar = document.getElementById('btn-voltar-main');
const btnLogout = document.getElementById('btn-logout');

// SELETORES ADICIONAIS PARA O CRUD 
const formProdutoSection = document.getElementById('form-produto-section');
const btnAdicionarProduto = document.getElementById('btn-adicionar-produto');
const btnVoltarForm = document.getElementById('btn-voltar-form');
const formProdutoTitulo = document.getElementById('form-produto-titulo');
const btnVoltarCrud = document.getElementById('btn-voltar-crud');
const produtoForm = document.getElementById('produto-form');
const produtosTbody = document.getElementById('produtos-tbody');
const produtoIdInput = document.getElementById('produto-id');
const produtoNomeInput = document.getElementById('produto-nome');
const produtoDescricaoInput = document.getElementById('produto-descricao');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
const modalMovimentacao = document.getElementById('modal-movimentacao');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const modalTitulo = document.getElementById('modal-titulo');
const movimentacaoForm = document.getElementById('movimentacao-form');

// FUNÇÕES DE CONTROLE DE VISIBILIDADE
function showSection(sectionToShow) {
    loginSection.classList.add('hidden');
    mainSection.classList.add('hidden');
    movimentacaoSection.classList.add('hidden');
    formProdutoSection.classList.add('hidden'); // ATUALIZADO

    sectionToShow.classList.remove('hidden');
}

// AUTENTICAÇÃO
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = "Conectando...";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
        msg.textContent = "Erro: " + error.message;
    } else {
        localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
        checkAuth(); // Verifica a autenticação e redireciona a visualização
    }
});

btnLogout.addEventListener('click', async () => {
    await client.auth.signOut();
    localStorage.removeItem('usuarioLogado');
    checkAuth();
});

// NAVEGAÇÃO 
btnMovimentacao.addEventListener('click', () => {
    showSection(movimentacaoSection);
    // Aqui você pode adicionar uma função para carregar os produtos do Supabase
    // carregarProdutos();
});

btnVoltar.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

// INICIALIZAÇÃO
function checkAuth() {
    const user = localStorage.getItem('usuarioLogado');
    if (user) {
        showSection(mainSection);
        carregarProdutos(); // CARREGA OS PRODUTOS AO MOSTRAR A TELA PRINCIPAL
    } else {
        showSection(loginSection);
    }
}

// Verifica se o usuário já esta autenticado
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

btnAdicionarProduto.addEventListener('click', () => {
    produtoForm.reset(); // Limpa o formulário caso tenha dados de uma edição anterior
    formProdutoTitulo.textContent = 'Adicionar Novo Produto'; // Garante o título correto
    showSection(formProdutoSection);
});

btnVoltarForm.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

// CRUD -- Create Read Update Delete
btnGerenciarProdutos.addEventListener('click', () => {
    showSection(produtosSection);
    carregarProdutos(); // Carrega os produtos ao entrar na seção
});

btnVoltarCrud.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

// FUNÇÕES DO CRUD

// READ: Carregar e exibir todos os produtos
async function carregarProdutos() {
    // ETAPA A: Calcular o estoque atual a partir das movimentações
    let { data: movimentacoes, error: movError } = await client
        .from('movimentacao')
        .select('id_produto, tipo, quantidade');

    if (movError) {
        console.error('Erro ao buscar movimentações:', movError);
        return;
    }
    
    const estoque = {}; // Ex: { produtoId_1: 10, produtoId_2: 5 }
    movimentacoes.forEach(mov => {
        if (!estoque[mov.id_produto]) {
            estoque[mov.id_produto] = 0;
        }
        if (mov.tipo === 'ENTRADA') {
            estoque[mov.id_produto] += mov.quantidade;
        } else { // 'SAÍDA'
            estoque[mov.id_produto] -= mov.quantidade;
        }
    });

    // ETAPA B: Buscar os produtos e montar a tabela
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
        const quantidadeAtual = estoque[produto.id] || 0; // Pega a quantidade ou 0 se não houver
        const tr = document.createElement('tr');

        // Note a nova coluna <td> para quantidade e os novos botões
        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.descricao}</td>
            <td><strong>${quantidadeAtual}</strong></td>
            <td><button class="outline" onclick="prepararEdicao(${produto.id},'${produto.nome}', '${produto.descricao}')">Editar</button></td>
            <td><button onclick="abrirModalMovimentacao(${produto.id}, '${produto.nome}', 'ENTRADA')">Entrada</button></td>
            <td><button class="contrast" onclick="abrirModalMovimentacao(${produto.id}, '${produto.nome}', 'SAIDA')">Retirada</button></td>
        `;
        produtosTbody.appendChild(tr);
    });
}

// CREATE / UPDATE: Lógica do formulário para salvar (criar ou atualizar)
produtoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // ... (toda a lógica de 'if (id)' para criar/atualizar continua a mesma) ...

    if (error) {
        alert('Erro ao salvar o produto: ' + error.message);
    } else {
        produtoForm.reset();
        showSection(mainSection); // VOLTA PARA A TELA PRINCIPAL
        carregarProdutos();      // RECARREGA A LISTA ATUALIZADA
    }
});

// Função para preparar o formulário para edição
function prepararEdicao(id, nome, descricao) {
    produtoIdInput.value = id;
    produtoNomeInput.value = nome;
    produtoDescricaoInput.value = descricao;
    
    formProdutoTitulo.textContent = 'Editar Produto'; // Muda o título do formulário
    showSection(formProdutoSection); // LEVA O USUÁRIO PARA A TELA DO FORMULÁRIO
}

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
    
    const { auth } = await client;
    const { data: { user } } = await auth.getUser(); // Pega o usuário logado

    if (!user) {
        alert('Usuário não autenticado. Faça login novamente.');
        return;
    }

    // Coleta os dados do formulário do modal
    const produtoId = document.getElementById('mov-produto-id').value;
    const tipo = document.getElementById('mov-tipo').value;
    const quantidade = parseInt(document.getElementById('mov-quantidade').value);
    const justificativa = document.getElementById('mov-justificativa').value;

    const { error } = await client
        .from('movimentacao')
        .insert([{ 
            id_produto: produtoId,
            id_usuario: user.id, // ID do usuário logado
            tipo: tipo,
            quantidade: quantidade,
            justificativa: justificativa
        }]);

    if (error) {
        alert('Erro ao registrar movimentação: ' + error.message);
    } else {
        movimentacaoForm.reset();
        modalMovimentacao.close();
        carregarProdutos(); // Recarrega a tabela principal para atualizar o estoque
    }
});
// DELETE: Deletar um produto
/*async function deletarProduto(id) {
    // Pede confirmação antes de excluir
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    const { error } = await client
        .from('produto')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Erro ao excluir o produto: ' + error.message);
    } else {
        carregarProdutos(); // Recarrega a lista
    }
}*/

// Cancela a edição e limpa o formulário
btnCancelarEdicao.addEventListener('click', () => {
    produtoForm.reset();
    produtoIdInput.value = '';
    showSection(mainSection);
});