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