const btnGerenciarCategorias = document.getElementById('btn-gerenciar-categorias');
const categoriaForm = document.getElementById('categoria-form');
const categoriasTbody = document.getElementById('categorias-tbody');

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
    const selectElement = document.getElementById(idDoSelect);
    if (!selectElement) {
        console.error(`Dropdown com id '${idDoSelect}' não encontrado.`);
        return;
    }

    const { data, error } = await client
        .from('categorias')
        .select('*')
        .order('nome');

    if (error) {
        console.error("Erro ao buscar categorias para o dropdown:", error);
        return;
    }

    selectElement.innerHTML = '<option value="">Selecione uma categoria...</option>';

    data.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nome;
        selectElement.appendChild(option);
    });
}

async function popularFiltroCategorias() {
    const filtroSelect = document.getElementById('filtro-categoria-select');
    
    const { data, error } = await client.from('categorias').select('*').order('nome');

    if (error) {
        console.error("Erro ao buscar categorias para o filtro:", error);
        return;
    }

    data.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nome;
        filtroSelect.appendChild(option);
    });
}

btnGerenciarCategorias.addEventListener('click', async () => {
    showSection(loadingSection);
    await carregarCategorias();
    showSection(categoriasSection);
});

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