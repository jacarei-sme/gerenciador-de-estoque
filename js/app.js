// IINICIALIZAÇÃO DO SUPABASE
const supabaseUrl = "https://jhxlbkjulksfrcuwfhcb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGxia2p1bGtzZnJjdXdmaGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTczNjQsImV4cCI6MjA3MzM3MzM2NH0.d6KOZxc1iJaI_wloMpa-xura80Fv-YXKijG2wuz5wZg";
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

// LOGIN
const loginForm = document.getElementById('login-form');
const msg = document.getElementById('mensagem');

const navSection = document.getElementById('nav-section');

// SELETORES DE ELEMENTOS - SEÇÕES PRINCIPAIS
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const addProdutoSection = document.getElementById('add-produto-section');
const editProdutoSection = document.getElementById('edit-produto-section');
const categoriasSection = document.getElementById('categorias-section');
const relatorioSection = document.getElementById('relatorio-section');
const produtosSection = document.getElementById('produtos-section');
const btnHomePage = document.getElementById('btn-home-page');
const loadingSection = document.getElementById('loading-section');

//MAIN
const btnLogout = document.getElementById('btn-logout');

// FUNÇÕES DE CONTROLE DE VISIBILIDADE
function showSection(sectionToShow) {
    loginSection.classList.add('hidden');
    mainSection.classList.add('hidden');
    addProdutoSection.classList.add('hidden');
    editProdutoSection.classList.add('hidden');
    categoriasSection.classList.add('hidden');
    relatorioSection.classList.add('hidden');
    produtosSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    resetPasswordSection.classList.add('hidden');
    resetSuccessSection.classList.add('hidden');

    sectionToShow.classList.remove('hidden');
}

btnHomePage.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});

async function carregarProdutosComEstoqueZerado() {
    const alertaContainer = document.getElementById('alerta-estoque-zerado');
    const listaEstoqueZerado = document.getElementById('lista-estoque-zerado');

    // 1. Faz a consulta no Supabase buscando produtos onde a quantidade é igual a 0
    const { data: produtos, error } = await client
        .from('produto')
        .select('nome') // Só precisamos do nome do produto
        .eq('quantidade', 0); // O filtro principal: quantidade é igual a 0

    if (error) {
        console.error("Erro ao buscar produtos com estoque zerado:", error);
        return;
    }

    // 2. Verifica se algum produto foi encontrado
    if (produtos && produtos.length > 0) {
        // Se encontrou produtos, limpa a lista antiga e mostra o container de alerta
        listaEstoqueZerado.innerHTML = '';
        alertaContainer.classList.remove('hidden');

        // 3. Adiciona cada produto encontrado como um item na lista
        produtos.forEach(produto => {
            const li = document.createElement('li');
            li.textContent = produto.nome;
            listaEstoqueZerado.appendChild(li);
        });
    } else {
        // Se não encontrou nenhum produto com estoque zerado, garante que o alerta fique escondido
        alertaContainer.classList.add('hidden');
    }
}

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
        navSection.classList.remove('hidden');
        checkAuth();
    }
});

btnLogout.addEventListener('click', async () => {
    await client.auth.signOut();
    localStorage.removeItem('usuarioLogado');
    navSection.classList.add('hidden');
    checkAuth();
});

function checkAuth() {
    const user = localStorage.getItem('usuarioLogado');
    if (user) {
        showSection(mainSection);
        navSection.classList.remove('hidden');
        carregarProdutosComEstoqueZerado();
        exibirNomeUsuario();
    } else {
        showSection(loginSection);
        navSection.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});


async function exibirNomeUsuario() {
    const userNameElement = document.getElementById('user-name');
    
    // 1. Pega o usuário atualmente logado da sessão do Supabase
    const { data: { user } } = await client.auth.getUser();

    // 2. Se houver um usuário, busca o perfil correspondente
    if (user) {
        const { data: profile, error } = await client
            .from('profiles')
            .select('first_name')
            .eq('id', user.id) // Busca o perfil com o ID do usuário logado
            .single(); // .single() é usado para pegar apenas um registro

        if (error) {
            console.error('Erro ao buscar o perfil do usuário:', error);
            userNameElement.textContent = 'Visitante'; // Nome padrão em caso de erro
        }

        // 3. Se encontrou o perfil e o nome existe, atualiza o HTML
        if (profile && profile.first_name) {
            userNameElement.textContent = profile.first_name;
        } else {
            userNameElement.textContent = 'Visitante'; // Nome padrão se o perfil ou nome não for encontrado
        }
    }
}