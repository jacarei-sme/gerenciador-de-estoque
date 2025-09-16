// --- INICIALIZAÇÃO E SUPABASE ---
const supabaseUrl = "https://jhxlbkjulksfrcuwfhcb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGxia2p1bGtzZnJjdXdmaGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTczNjQsImV4cCI6MjA3MzM3MzM2NH0.d6KOZxc1iJaI_wloMpa-xura80Fv-YXKijG2wuz5wZg";
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

// --- SELETORES DE ELEMENTOS ---
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const movimentacaoSection = document.getElementById('movimentacao-section');

const loginForm = document.getElementById('login-form');
const msg = document.getElementById('mensagem');

const btnMovimentacao = document.getElementById('btn-movimentacao');
const btnVoltar = document.getElementById('btn-voltar-main');
const btnLogout = document.getElementById('btn-logout');

// --- SELETORES ADICIONAIS PARA O CRUD ---
const produtosSection = document.getElementById('produtos-section');
const btnGerenciarProdutos = document.getElementById('btn-gerenciar-produtos');
const btnVoltarCrud = document.getElementById('btn-voltar-crud');
const produtoForm = document.getElementById('produto-form');
const produtosTbody = document.getElementById('produtos-tbody');
const produtoIdInput = document.getElementById('produto-id');
const produtoNomeInput = document.getElementById('produto-nome');
const produtoDescricaoInput = document.getElementById('produto-descricao');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');

// --- FUNÇÕES DE CONTROLE DE VISIBILIDADE ---

// Função para mostrar uma seção e esconder as outras
function showSection(sectionToShow) {
    loginSection.classList.add('hidden');
    mainSection.classList.add('hidden');
    movimentacaoSection.classList.add('hidden');
    
    sectionToShow.classList.remove('hidden');
}

// --- LÓGICA DE AUTENTICAÇÃO ---

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

// --- LÓGICA DE NAVEGAÇÃO ---
btnMovimentacao.addEventListener('click', () => {
    showSection(movimentacaoSection);
    // Aqui você pode adicionar uma função para carregar os produtos do Supabase
    // carregarProdutos();
});

btnVoltar.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

// --- CONTROLE DE INICIALIZAÇÃO ---

function checkAuth() {
    const user = localStorage.getItem('usuarioLogado');
    if (user) {
        showSection(mainSection);
    } else {
        showSection(loginSection);
    }
}

// Verifica a autenticação assim que a página é carregada
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// --- NAVEGAÇÃO PARA A SEÇÃO CRUD ---
btnGerenciarProdutos.addEventListener('click', () => {
    showSection(produtosSection);
    carregarProdutos(); // Carrega os produtos ao entrar na seção
});

btnVoltarCrud.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});


// --- FUNÇÕES CRUD ---

// READ: Carregar e exibir todos os produtos
async function carregarProdutos() {
    const { data: produtos, error } = await client
        .from('produto')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        console.error('Erro ao carregar produtos:', error);
        return;
    }

    // Limpa a tabela antes de preencher
    produtosTbody.innerHTML = ''; 

    // Cria uma linha na tabela para cada produto
    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.descricao}</td>
            <td><button class="outline" onclick="prepararEdicao(${produto.id},'${produto.nome}', '${produto.descricao}')">Editar</button></td>
            <td><button class="contrast" onclick="deletarProduto(${produto.id})">Excluir</button></td>
        `;
        produtosTbody.appendChild(tr);
    });
}

// CREATE / UPDATE: Lógica do formulário para salvar (criar ou atualizar)
produtoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = produtoIdInput.value;
    const nome = produtoNomeInput.value;
    const descricao = produtoDescricaoInput.value;

    let error;

    if (id) {
        // UPDATE: Se existe um ID, atualiza o produto
        const { error: updateError } = await client
            .from('produto')
            .update({ nome, descricao })
            .eq('id', id);
        error = updateError;
    } else {
        // CREATE: Se não existe ID, insere um novo produto
        const { error: insertError } = await client
            .from('produto')
            .insert([{ nome, descricao }]);
        error = insertError;
    }

    if (error) {
        alert('Erro ao salvar o produto: ' + error.message);
    } else {
        produtoForm.reset(); // Limpa o formulário
        carregarProdutos(); // Recarrega a lista
    }
});

// Função para preparar o formulário para edição
function prepararEdicao(id, nome, descricao) {
    produtoIdInput.value = id;
    produtoNomeInput.value = nome;
    produtoDescricaoInput.value = descricao;
    window.scrollTo(0, 0); // Rola para o topo da página para ver o formulário
}

// DELETE: Deletar um produto
async function deletarProduto(id) {
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
}

// Cancela a edição e limpa o formulário
btnCancelarEdicao.addEventListener('click', () => {
    produtoForm.reset();
    produtoIdInput.value = ''; // Garante que o ID oculto seja limpo
});