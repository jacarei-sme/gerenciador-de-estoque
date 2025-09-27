//CATEGORIAS
const btnGerenciarCategorias = document.getElementById('btn-gerenciar-categorias');
const categoriaForm = document.getElementById('categoria-form');
const categoriasTbody = document.getElementById('categorias-tbody');
//const btnVoltarCategorias = document.getElementById('btn-voltar-categorias');

// CATEGORIA
btnGerenciarCategorias.addEventListener('click', async () => {
    showSection(loadingSection);
    await carregarCategorias();
    showSection(categoriasSection);
});

/*btnVoltarCategorias.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(mainSection);
});*/

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