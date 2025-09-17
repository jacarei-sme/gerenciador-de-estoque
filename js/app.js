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
//const btnMovimentacao = document.getElementById('btn-movimentacao');
const btnUltimasMovimentacoes = document.getElementById('btn-ultimas-movimentacoes');
const btnVoltar = document.getElementById('btn-voltar-main');
const btnLogout = document.getElementById('btn-logout');

// SELETORES ADICIONAIS PARA O CRUD 
const formProdutoSection = document.getElementById('form-produto-section');
const produtoForm = document.getElementById('produto-form');
const movimentacaoForm = document.getElementById('movimentacao-form');
const formProdutoTitulo = document.getElementById('form-produto-titulo');

const btnAdicionarProduto = document.getElementById('btn-adicionar-produto');
const btnVoltarForm = document.getElementById('btn-voltar-form');
const btnVoltarCrud = document.getElementById('btn-voltar-crud');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const relatorioSection = document.getElementById('relatorio-section');
const relatorioTbody = document.getElementById('relatorio-tbody');
const relatorioTitulo = document.getElementById('relatorio-titulo');
const btnRelatorioCompleto = document.getElementById('btn-relatorio-completo');
const btnVoltarRelatorio = document.getElementById('btn-voltar-relatorio');

const produtosTbody = document.getElementById('produtos-tbody');
const produtoIdInput = document.getElementById('produto-id');
const produtoNomeInput = document.getElementById('produto-nome');
const produtoDescricaoInput = document.getElementById('produto-descricao');

const modalMovimentacao = document.getElementById('modal-movimentacao');
const modalTitulo = document.getElementById('modal-titulo');

const containerQuantidadeInicial = document.getElementById('container-quantidade-inicial');

// FUNÇÕES DE CONTROLE DE VISIBILIDADE
function showSection(sectionToShow) {
    loginSection.classList.add('hidden');
    mainSection.classList.add('hidden');
    formProdutoSection.classList.add('hidden');
    relatorioSection.classList.add('hidden'); // <-- ADICIONE ESTA LINHA
    
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
btnVoltar.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

btnUltimasMovimentacoes.addEventListener('click', () => {
    relatorioTitulo.textContent = 'Últimas 20 Movimentações';
    carregarRelatorio(20); 
    showSection(relatorioSection);
});

btnRelatorioCompleto.addEventListener('click', () => {
    relatorioTitulo.textContent = 'Relatório de Movimentações';
    carregarRelatorio(); // Sem limite
    showSection(relatorioSection);
});

btnVoltarRelatorio.addEventListener('click', (e) => {
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
    produtoForm.reset(); 
    document.getElementById('produto-quantidade-inicial').value = '0'; // Reseta para 0
    formProdutoTitulo.textContent = 'Adicionar Novo Produto';
    containerQuantidadeInicial.style.display = 'block'; // MOSTRA o campo de quantidade
    showSection(formProdutoSection);
});

btnVoltarForm.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

btnCancelarEdicao.addEventListener('click', () => {
    produtoForm.reset();
    produtoIdInput.value = '';
    showSection(mainSection);
});

async function carregarRelatorio(limite = null) {
    let query = client
        .from('relatorio_completo')
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
            <td>${mov.usuario_email}</td>
            <td>${mov.justificativa || '-'}</td>
        `;
        relatorioTbody.appendChild(tr);
    });
}

// CRUD -- Create Read Update Delete

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
        //const quantidadeAtual = estoque[produto.quantidade] || 0; // Pega a quantidade ou 0 se não houver
        const tr = document.createElement('tr');

        // Note a nova coluna <td> para quantidade e os novos botões
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

// CREATE / UPDATE: Lógica do formulário para salvar (criar ou atualizar)
produtoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('produto-id').value;
    const nome = document.getElementById('produto-nome').value;
    const descricao = document.getElementById('produto-descricao').value;
    const quantidade = parseInt(document.getElementById('produto-quantidade-inicial').value);

    // --- LÓGICA DE ATUALIZAÇÃO (quando está editando um produto) ---
    if (id) {
        const { error } = await client
            .from('produto')
            .update({ nome, descricao, quantidade })
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar o produto: ' + error.message);
        } else {
            showSection(mainSection);
            carregarProdutos();
        }
        return; // Termina a execução aqui
    }

    // --- LÓGICA DE CRIAÇÃO (para um novo produto) ---
    // 1. Insere o novo produto e usa .select() para pegar o ID de volta
    const { data: novoProduto, error: produtoError } = await client
        .from('produto')
        .insert([{ nome, descricao, quantidade }])
        .select();

    if (produtoError) {
        alert('Erro ao cadastrar o produto: ' + produtoError.message);
        return;
    }

    // 2. Se a quantidade inicial for maior que 0, cria a primeira movimentação
    if (quantidade > 0) {
        const { auth } = await client;
        const { data: { user } } = await auth.getUser();
        const novoProdutoId = novoProduto[0].id; // Pega o ID do produto que acabamos de criar

        const { error: movError } = await client
            .from('movimentacao')
            .insert([{
                id_produto: novoProdutoId,
                id_usuario: user.id,
                tipo: 'ENTRADA',
                quantidade: quantidade,
                observacao: 'Carga inicial de estoque'
            }]);
        
        if (movError) {
            alert('Produto cadastrado, mas houve um erro ao registrar a quantidade inicial: ' + movError.message);
        }
    }

    // 3. Sucesso! Limpa tudo e volta para a tela principal
    produtoForm.reset();
    showSection(mainSection);
    carregarProdutos();
});

// Função para preparar o formulário para edição
function prepararEdicao(id, nome, descricao) {
    produtoIdInput.value = id;
    produtoNomeInput.value = nome;
    produtoDescricaoInput.value = descricao;
    
    formProdutoTitulo.textContent = 'Editar Produto';
    containerQuantidadeInicial.style.display = 'none'; // ESCONDE o campo de quantidade
    showSection(formProdutoSection);
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
            observacao: justificativa
        }]);

    if (error) {
        alert('Erro ao registrar movimentação: ' + error.message);
    } else {
        movimentacaoForm.reset();
        modalMovimentacao.close();
        carregarProdutos(); // Recarrega a tabela principal para atualizar o estoque
    }
});
